using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;
using System.Reflection;
using System.Collections.Generic;
using System.Windows.Forms;

namespace Mumbye
{
    static class Program
    {
        private static HttpListener _listener;
        private static string _webRootDir;
        private static bool _isRunning = true;

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                // Determine base directory
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string currentDir = Directory.GetCurrentDirectory();

                // Look for dist folder locally first
                string candidate1 = Path.Combine(exeDir, "dist");
                string candidate2 = Path.Combine(currentDir, "dist");
                string candidate3 = exeDir;

                if (File.Exists(Path.Combine(candidate1, "index.html")))
                {
                    _webRootDir = candidate1;
                }
                else if (File.Exists(Path.Combine(candidate2, "index.html")))
                {
                    _webRootDir = candidate2;
                }
                else if (File.Exists(Path.Combine(candidate3, "index.html")))
                {
                    _webRootDir = candidate3;
                }
                else
                {
                    // Auto-extract from embedded dist.zip resource if available
                    _webRootDir = Path.Combine(exeDir, "dist");
                    ExtractEmbeddedPayload(_webRootDir);
                }

                if (!File.Exists(Path.Combine(_webRootDir, "index.html")))
                {
                    MessageBox.Show(
                        "Could not locate game assets (index.html).\nPlease ensure the 'dist' folder exists.",
                        "Mumbye: Maximum City",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // Find a free TCP port
                int port = GetAvailablePort();

                // Start local web server
                _listener = new HttpListener();
                _listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                _listener.Start();

                Thread serverThread = new Thread(ServerLoop);
                serverThread.IsBackground = true;
                serverThread.Start();

                // Launch game window
                LaunchGameWindow(port);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Error launching Mumbye:\n" + ex.Message,
                    "Mumbye: Maximum City",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private static void ExtractEmbeddedPayload(string targetDir)
        {
            try
            {
                Assembly asm = Assembly.GetExecutingAssembly();
                string resourceName = null;

                foreach (string name in asm.GetManifestResourceNames())
                {
                    if (name.EndsWith("dist.zip", StringComparison.OrdinalIgnoreCase))
                    {
                        resourceName = name;
                        break;
                    }
                }

                if (resourceName != null)
                {
                    if (!Directory.Exists(targetDir))
                    {
                        Directory.CreateDirectory(targetDir);
                    }

                    using (Stream s = asm.GetManifestResourceStream(resourceName))
                    using (ZipArchive archive = new ZipArchive(s, ZipArchiveMode.Read))
                    {
                        archive.ExtractToDirectory(targetDir);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Payload extraction notice: " + ex.Message);
            }
        }

        private static int GetAvailablePort()
        {
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        private static void ServerLoop()
        {
            while (_isRunning && _listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem((ctxObj) => ProcessRequest((HttpListenerContext)ctxObj), context);
                }
                catch
                {
                    if (!_isRunning) break;
                }
            }
        }

        private static void ProcessRequest(HttpListenerContext context)
        {
            try
            {
                string rawUrl = context.Request.RawUrl;
                if (string.IsNullOrEmpty(rawUrl) || rawUrl == "/")
                {
                    rawUrl = "/index.html";
                }

                // Strip query parameters
                int qIdx = rawUrl.IndexOf('?');
                if (qIdx >= 0)
                {
                    rawUrl = rawUrl.Substring(0, qIdx);
                }

                string relativePath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(_webRootDir, relativePath);

                if (!File.Exists(filePath))
                {
                    // Fallback to index.html for SPA routes
                    filePath = Path.Combine(_webRootDir, "index.html");
                }

                if (File.Exists(filePath))
                {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLowerInvariant();
                    string mime = GetMimeType(ext);

                    context.Response.StatusCode = 200;
                    context.Response.ContentType = mime;
                    context.Response.ContentLength64 = bytes.Length;
                    context.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
                    context.Response.Headers.Add("Access-Control-Allow-Origin", "*");

                    context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                    context.Response.OutputStream.Close();
                }
                else
                {
                    context.Response.StatusCode = 404;
                    context.Response.Close();
                }
            }
            catch
            {
                try { context.Response.Close(); } catch { }
            }
        }

        private static string GetMimeType(string ext)
        {
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".svg": return "image/svg+xml";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".ico": return "image/x-icon";
                case ".wav": return "audio/wav";
                case ".mp3": return "audio/mpeg";
                case ".map": return "application/json";
                default: return "application/octet-stream";
            }
        }

        private static void LaunchGameWindow(int port)
        {
            string url = "http://127.0.0.1:" + port + "/";
            string browserPath = FindBrowserExecutable();
            string tempProfileDir = Path.Combine(Path.GetTempPath(), "MumbyeGameProfile_" + Guid.NewGuid().ToString("N"));

            if (!string.IsNullOrEmpty(browserPath) && File.Exists(browserPath))
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = browserPath;
                psi.Arguments = string.Format(
                    "--app=\"{0}\" --window-size=1280,780 --disable-infobars --no-first-run --no-default-browser-check --user-data-dir=\"{1}\"",
                    url,
                    tempProfileDir
                );
                psi.UseShellExecute = false;

                Process p = Process.Start(psi);
                if (p != null)
                {
                    p.WaitForExit();
                }
            }
            else
            {
                // Fallback to default browser
                Process p = Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                if (p != null)
                {
                    p.WaitForExit();
                }
            }

            // Cleanup
            _isRunning = false;
            try { _listener.Stop(); } catch { }
            try
            {
                if (Directory.Exists(tempProfileDir))
                {
                    Directory.Delete(tempProfileDir, true);
                }
            }
            catch { }
        }

        private static string FindBrowserExecutable()
        {
            string[] searchPaths = new string[]
            {
                // Edge 32/64
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),

                // Chrome 32/64
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
            };

            foreach (string path in searchPaths)
            {
                if (File.Exists(path))
                {
                    return path;
                }
            }

            return null;
        }
    }
}

using System;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace MumbyeDesktop
{
    public class MainWindow : Form
    {
        private IntPtr _hdc;
        private IntPtr _hglrc;
        private bool _isContextCreated;

        private World _world;
        private Player _player;
        private TrafficManager _traffic;
        private PedestrianManager _pedestrians;

        private Stopwatch _timer;
        private long _lastTime;
        private float _fps;
        private int _frameCount;
        private float _fpsAccumulator;

        // Input States
        private bool _keyW, _keyA, _keyS, _keyD;
        private bool _keyShift, _keySpace;
        private bool _keyEJustPressed;
        private bool _mouseLeftDown;
        private bool _isCursorLocked = true;

        [DllImport("user32.dll")] private static extern bool SetCursorPos(int X, int Y);

        public MainWindow()
        {
            this.Text = "Mumbye: Maximum City — Native 3D Desktop Edition (60+ FPS)";
            this.ClientSize = new Size(1280, 720);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.Opaque | ControlStyles.UserPaint, true);

            InitOpenGL();

            _world = new World();
            _player = new Player();
            _traffic = new TrafficManager();
            _pedestrians = new PedestrianManager();

            _timer = Stopwatch.StartNew();
            _lastTime = _timer.ElapsedTicks;

            this.KeyDown += OnKeyDown;
            this.KeyUp += OnKeyUp;
            this.MouseDown += OnMouseDown;
            this.MouseUp += OnMouseUp;
            this.MouseMove += OnMouseMove;
            this.Resize += OnResize;
        }

        private void InitOpenGL()
        {
            _hdc = GL.GetDC(this.Handle);

            var pfd = new GL.PIXELFORMATDESCRIPTOR();
            pfd.nSize = (ushort)Marshal.SizeOf(pfd);
            pfd.nVersion = 1;
            pfd.dwFlags = GL.PFD_DRAW_TO_WINDOW | GL.PFD_SUPPORT_OPENGL | GL.PFD_DOUBLEBUFFER;
            pfd.iPixelType = GL.PFD_TYPE_RGBA;
            pfd.cColorBits = 32;
            pfd.cDepthBits = 24;

            int format = GL.ChoosePixelFormat(_hdc, ref pfd);
            GL.SetPixelFormat(_hdc, format, ref pfd);

            _hglrc = GL.wglCreateContext(_hdc);
            GL.wglMakeCurrent(_hdc, _hglrc);

            _isContextCreated = true;

            // OpenGL Setup: Depth testing, lighting, golden hour sunset fog
            GL.glEnable(GL.GL_DEPTH_TEST);
            GL.glDepthFunc(GL.GL_LEQUAL);
            GL.glShadeModel(GL.GL_SMOOTH);

            GL.glEnable(GL.GL_LIGHTING);
            GL.glEnable(GL.GL_LIGHT0);
            GL.glEnable(GL.GL_COLOR_MATERIAL);
            GL.glColorMaterial(GL.GL_FRONT_AND_BACK, GL.GL_AMBIENT_AND_DIFFUSE);

            // Sun light (Golden sunset over Arabian Sea)
            float[] lightPos = new float[] { -80f, 120f, -80f, 1.0f };
            float[] lightAmbient = new float[] { 0.35f, 0.32f, 0.30f, 1.0f };
            float[] lightDiffuse = new float[] { 1.0f, 0.88f, 0.72f, 1.0f };
            GL.glLightfv(GL.GL_LIGHT0, GL.GL_POSITION, lightPos);
            GL.glLightfv(GL.GL_LIGHT0, GL.GL_AMBIENT, lightAmbient);
            GL.glLightfv(GL.GL_LIGHT0, GL.GL_DIFFUSE, lightDiffuse);

            // Atmospheric Fog (Mumbai coastal haze)
            GL.glEnable(GL.GL_FOG);
            GL.glFogi(GL.GL_FOG_MODE, (int)GL.GL_FOG_EXP2);
            GL.glFogf(GL.GL_FOG_DENSITY, 0.0035f);
            float[] fogColor = new float[] { 0.85f, 0.65f, 0.48f, 1.0f }; // Warm golden sunset
            GL.glFogfv(GL.GL_FOG_COLOR, fogColor);

            GL.glClearColor(0.85f, 0.65f, 0.48f, 1.0f);
        }

        private void OnResize(object sender, EventArgs e)
        {
            if (!_isContextCreated) return;
            GL.glViewport(0, 0, this.ClientSize.Width, this.ClientSize.Height);
        }

        private void OnKeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.W || e.KeyCode == Keys.Up) _keyW = true;
            if (e.KeyCode == Keys.S || e.KeyCode == Keys.Down) _keyS = true;
            if (e.KeyCode == Keys.A || e.KeyCode == Keys.Left) _keyA = true;
            if (e.KeyCode == Keys.D || e.KeyCode == Keys.Right) _keyD = true;
            if (e.KeyCode == Keys.ShiftKey) _keyShift = true;
            if (e.KeyCode == Keys.Space) _keySpace = true;

            if (e.KeyCode == Keys.E)
            {
                _keyEJustPressed = true;
            }
            if (e.KeyCode == Keys.Tab || e.KeyCode == Keys.Q)
            {
                _player.CycleWeapon();
            }
            if (e.KeyCode == Keys.Escape)
            {
                _isCursorLocked = !_isCursorLocked;
                Cursor.Show();
            }
        }

        private void OnKeyUp(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.W || e.KeyCode == Keys.Up) _keyW = false;
            if (e.KeyCode == Keys.S || e.KeyCode == Keys.Down) _keyS = false;
            if (e.KeyCode == Keys.A || e.KeyCode == Keys.Left) _keyA = false;
            if (e.KeyCode == Keys.D || e.KeyCode == Keys.Right) _keyD = false;
            if (e.KeyCode == Keys.ShiftKey) _keyShift = false;
            if (e.KeyCode == Keys.Space) _keySpace = false;
        }

        private void OnMouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left) _mouseLeftDown = true;
            _isCursorLocked = true;
            Cursor.Hide();
        }

        private void OnMouseUp(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left) _mouseLeftDown = false;
        }

        private void OnMouseMove(object sender, MouseEventArgs e)
        {
            if (!_isCursorLocked) return;

            Point center = this.PointToScreen(new Point(this.ClientSize.Width / 2, this.ClientSize.Height / 2));
            int dx = Cursor.Position.X - center.X;
            int dy = Cursor.Position.Y - center.Y;

            if (dx != 0 || dy != 0)
            {
                _player.Yaw += dx * 0.0032f;
                _player.Pitch = FastMath.Clamp(_player.Pitch + dy * 0.0028f, -0.45f, 0.85f);
                SetCursorPos(center.X, center.Y);
            }
        }

        public void GameLoop()
        {
            long now = _timer.ElapsedTicks;
            float delta = (float)(now - _lastTime) / Stopwatch.Frequency;
            _lastTime = now;

            // Clamp delta to avoid spiral of death
            if (delta > 0.05f) delta = 0.05f;

            // FPS Tracking
            _frameCount++;
            _fpsAccumulator += delta;
            if (_fpsAccumulator >= 0.5f)
            {
                _fps = _frameCount / _fpsAccumulator;
                _frameCount = 0;
                _fpsAccumulator = 0;
                this.Text = string.Format("Mumbye: Maximum City — Native 3D Desktop Edition [{0:0} FPS]", _fps);
            }

            // Update Simulation
            var nearestVeh = _traffic.GetNearestVehicle(_player.Position);

            if (_player.IsDriving && _player.CurrentVehicle != null)
            {
                _player.CurrentVehicle.Update(delta, _world, _keyW, _keyS, _keyA, _keyD, _keySpace);
                _player.Update(delta, _world, false, false, false, false, false, false, false, nearestVeh, _keyEJustPressed);
            }
            else
            {
                _player.Update(delta, _world, _keyW, _keyS, _keyA, _keyD, _keyShift, _keySpace, _mouseLeftDown, nearestVeh, _keyEJustPressed);
            }
            _keyEJustPressed = false;

            _traffic.Update(delta, _world, _player);
            _pedestrians.Update(delta, _world);

            // Render Frame
            RenderFrame((float)_timer.Elapsed.TotalSeconds);
        }

        private void RenderFrame(float time)
        {
            GL.glClear(GL.GL_COLOR_BUFFER_BIT | GL.GL_DEPTH_BUFFER_BIT);

            int w = this.ClientSize.Width;
            int h = this.ClientSize.Height;
            if (h == 0) h = 1;

            // 1. Perspective 3D Setup
            GL.glMatrixMode(GL.GL_PROJECTION);
            GL.glLoadIdentity();
            GL.Perspective(62.0, (double)w / h, 0.2, 800.0);

            // 2. Third-Person Chase Camera Setup
            GL.glMatrixMode(GL.GL_MODELVIEW);
            GL.glLoadIdentity();

            float camDist = _player.IsDriving ? 8.5f : 4.8f;
            float camHeight = _player.IsDriving ? 3.2f : 2.0f;

            float targetX = _player.Position.X;
            float targetY = _player.Position.Y + 1.2f;
            float targetZ = _player.Position.Z;

            float camX = targetX - (float)(Math.Sin(_player.Yaw) * Math.Cos(_player.Pitch)) * camDist;
            float camY = targetY + (float)Math.Sin(_player.Pitch) * camDist + camHeight;
            float camZ = targetZ - (float)(Math.Cos(_player.Yaw) * Math.Cos(_player.Pitch)) * camDist;

            // LookAt transformation
            LookAt(camX, camY, camZ, targetX, targetY, targetZ, 0, 1, 0);

            // 3. Render 3D Scene Elements
            _world.Render(time);
            _traffic.Render();
            _pedestrians.Render();
            _player.Render();

            // 4. Render 2D HUD & Minimap Overlay
            HUD.Render(w, h, _player, _world, _traffic, _fps);

            // 5. Present Backbuffer to Screen
            GL.SwapBuffers(_hdc);
        }

        private static void LookAt(float eyeX, float eyeY, float eyeZ, float targetX, float targetY, float targetZ, float upX, float upY, float upZ)
        {
            Vector3 forward = new Vector3(targetX - eyeX, targetY - eyeY, targetZ - eyeZ).Normalized();
            Vector3 side = Vector3.Cross(forward, new Vector3(upX, upY, upZ)).Normalized();
            Vector3 up = Vector3.Cross(side, forward);

            float[] m = new float[] {
                side.X,    up.X,    -forward.X, 0,
                side.Y,    up.Y,    -forward.Y, 0,
                side.Z,    up.Z,    -forward.Z, 0,
                0,         0,        0,         1
            };

            GL.glMultMatrixf(m);
            GL.glTranslatef(-eyeX, -eyeY, -eyeZ);
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            if (_hglrc != IntPtr.Zero)
            {
                GL.wglMakeCurrent(IntPtr.Zero, IntPtr.Zero);
                GL.wglDeleteContext(_hglrc);
            }
            if (_hdc != IntPtr.Zero)
            {
                GL.ReleaseDC(this.Handle, _hdc);
            }
            base.OnFormClosed(e);
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            MainWindow window = new MainWindow();
            window.Show();

            // High-Performance Game Loop
            while (window.Created)
            {
                window.GameLoop();
                Application.DoEvents();
            }
        }
    }
}

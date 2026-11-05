using System;
using System.Runtime.InteropServices;

namespace MumbyeDesktop
{
    public static class GL
    {
        public const uint GL_COLOR_BUFFER_BIT   = 0x00004000;
        public const uint GL_DEPTH_BUFFER_BIT   = 0x00000100;
        public const uint GL_TRIANGLES          = 0x0004;
        public const uint GL_TRIANGLE_STRIP     = 0x0005;
        public const uint GL_TRIANGLE_FAN       = 0x0006;
        public const uint GL_QUADS              = 0x0007;
        public const uint GL_QUAD_STRIP         = 0x0008;
        public const uint GL_LINES              = 0x0001;
        public const uint GL_LINE_STRIP         = 0x0003;
        public const uint GL_POINTS             = 0x0000;
        public const uint GL_LINE_LOOP          = 0x0002;

        public const uint GL_DEPTH_TEST         = 0x0B71;
        public const uint GL_CULL_FACE          = 0x0B44;
        public const uint GL_LIGHTING           = 0x0B50;
        public const uint GL_LIGHT0             = 0x4000;
        public const uint GL_COLOR_MATERIAL     = 0x0B57;
        public const uint GL_BLEND              = 0x0BE2;
        public const uint GL_FOG                = 0x0B60;
        public const uint GL_FOG_MODE           = 0x0B65;
        public const uint GL_FOG_DENSITY        = 0x0B62;
        public const uint GL_FOG_COLOR          = 0x0B66;
        public const uint GL_FOG_EXP2           = 0x0801;
        public const uint GL_SRC_ALPHA          = 0x0302;
        public const uint GL_ONE_MINUS_SRC_ALPHA= 0x0303;

        public const uint GL_MODELVIEW          = 0x1700;
        public const uint GL_PROJECTION         = 0x1701;

        public const uint GL_POSITION           = 0x1203;
        public const uint GL_AMBIENT            = 0x1200;
        public const uint GL_DIFFUSE            = 0x1201;
        public const uint GL_SPECULAR           = 0x1202;
        public const uint GL_FRONT_AND_BACK     = 0x0408;
        public const uint GL_AMBIENT_AND_DIFFUSE= 0x1602;

        public const uint GL_LEQUAL             = 0x0203;
        public const uint GL_SMOOTH             = 0x1D01;
        public const uint GL_FLAT               = 0x1D00;

        [DllImport("opengl32.dll")] public static extern void glClear(uint mask);
        [DllImport("opengl32.dll")] public static extern void glClearColor(float r, float g, float b, float a);
        [DllImport("opengl32.dll")] public static extern void glClearDepth(double depth);
        [DllImport("opengl32.dll")] public static extern void glEnable(uint cap);
        [DllImport("opengl32.dll")] public static extern void glDisable(uint cap);
        [DllImport("opengl32.dll")] public static extern void glDepthFunc(uint func);
        [DllImport("opengl32.dll")] public static extern void glShadeModel(uint mode);
        [DllImport("opengl32.dll")] public static extern void glViewport(int x, int y, int width, int height);
        [DllImport("opengl32.dll")] public static extern void glMatrixMode(uint mode);
        [DllImport("opengl32.dll")] public static extern void glLoadIdentity();
        [DllImport("opengl32.dll")] public static extern void glPushMatrix();
        [DllImport("opengl32.dll")] public static extern void glPopMatrix();
        [DllImport("opengl32.dll")] public static extern void glTranslatef(float x, float y, float z);
        [DllImport("opengl32.dll")] public static extern void glRotatef(float angle, float x, float y, float z);
        [DllImport("opengl32.dll")] public static extern void glScalef(float x, float y, float z);
        [DllImport("opengl32.dll")] public static extern void glBegin(uint mode);
        [DllImport("opengl32.dll")] public static extern void glEnd();
        [DllImport("opengl32.dll")] public static extern void glVertex3f(float x, float y, float z);
        [DllImport("opengl32.dll")] public static extern void glVertex2f(float x, float y);
        [DllImport("opengl32.dll")] public static extern void glColor3f(float r, float g, float b);
        [DllImport("opengl32.dll")] public static extern void glColor4f(float r, float g, float b, float a);
        [DllImport("opengl32.dll")] public static extern void glNormal3f(float nx, float ny, float nz);
        [DllImport("opengl32.dll")] public static extern void glLineWidth(float width);
        [DllImport("opengl32.dll")] public static extern void glPointSize(float size);
        [DllImport("opengl32.dll")] public static extern void glBlendFunc(uint sfactor, uint dfactor);
        [DllImport("opengl32.dll")] public static extern void glFogi(uint pname, int param);
        [DllImport("opengl32.dll")] public static extern void glFogf(uint pname, float param);
        [DllImport("opengl32.dll")] public static extern void glFogfv(uint pname, float[] paramsArray);
        [DllImport("opengl32.dll")] public static extern void glLightfv(uint light, uint pname, float[] paramsArray);
        [DllImport("opengl32.dll")] public static extern void glColorMaterial(uint face, uint mode);
        [DllImport("opengl32.dll")] public static extern void glOrtho(double left, double right, double bottom, double top, double zNear, double zFar);
        [DllImport("opengl32.dll")] public static extern void glMultMatrixf(float[] m);

        [DllImport("opengl32.dll")] public static extern IntPtr wglCreateContext(IntPtr hdc);
        [DllImport("opengl32.dll")] public static extern bool wglMakeCurrent(IntPtr hdc, IntPtr hglrc);
        [DllImport("opengl32.dll")] public static extern bool wglDeleteContext(IntPtr hglrc);

        [DllImport("gdi32.dll")] public static extern int ChoosePixelFormat(IntPtr hdc, ref PIXELFORMATDESCRIPTOR pfd);
        [DllImport("gdi32.dll")] public static extern bool SetPixelFormat(IntPtr hdc, int format, ref PIXELFORMATDESCRIPTOR pfd);
        [DllImport("gdi32.dll")] public static extern bool SwapBuffers(IntPtr hdc);

        [DllImport("user32.dll")] public static extern IntPtr GetDC(IntPtr hwnd);
        [DllImport("user32.dll")] public static extern int ReleaseDC(IntPtr hwnd, IntPtr hdc);

        public const uint PFD_DRAW_TO_WINDOW = 0x00000004;
        public const uint PFD_SUPPORT_OPENGL = 0x00000020;
        public const uint PFD_DOUBLEBUFFER   = 0x00000001;
        public const byte PFD_TYPE_RGBA      = 0;

        [StructLayout(LayoutKind.Sequential)]
        public struct PIXELFORMATDESCRIPTOR
        {
            public ushort nSize;
            public ushort nVersion;
            public uint dwFlags;
            public byte iPixelType;
            public byte cColorBits;
            public byte cRedBits;
            public byte cRedShift;
            public byte cGreenBits;
            public byte cGreenShift;
            public byte cBlueBits;
            public byte cBlueShift;
            public byte cAlphaBits;
            public byte cAlphaShift;
            public byte cAccumBits;
            public byte cAccumRedBits;
            public byte cAccumGreenBits;
            public byte cAccumBlueBits;
            public byte cAccumAlphaBits;
            public byte cDepthBits;
            public byte cStencilBits;
            public byte cAuxBuffers;
            public byte iLayerType;
            public byte bReserved;
            public uint dwLayerMask;
            public uint dwVisibleMask;
            public uint dwDamageMask;
        }

        public static void Perspective(double fovY, double aspect, double zNear, double zFar)
        {
            double fH = Math.Tan(fovY / 360.0 * Math.PI) * zNear;
            double fW = fH * aspect;
            glFrustum(-fW, fW, -fH, fH, zNear, zFar);
        }

        [DllImport("opengl32.dll")]
        public static extern void glFrustum(double left, double right, double bottom, double top, double zNear, double zFar);
    }
}

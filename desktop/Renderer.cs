using System;

namespace MumbyeDesktop
{
    public static class Renderer
    {
        public static void DrawBox(float x, float y, float z, float sx, float sy, float sz, float r, float g, float b)
        {
            float hx = sx * 0.5f;
            float hy = sy * 0.5f;
            float hz = sz * 0.5f;

            GL.glPushMatrix();
            GL.glTranslatef(x, y + hy, z);
            GL.glColor3f(r, g, b);

            GL.glBegin(GL.GL_QUADS);

            // Front
            GL.glNormal3f(0, 0, 1);
            GL.glVertex3f(-hx, -hy,  hz);
            GL.glVertex3f( hx, -hy,  hz);
            GL.glVertex3f( hx,  hy,  hz);
            GL.glVertex3f(-hx,  hy,  hz);

            // Back
            GL.glNormal3f(0, 0, -1);
            GL.glVertex3f( hx, -hy, -hz);
            GL.glVertex3f(-hx, -hy, -hz);
            GL.glVertex3f(-hx,  hy, -hz);
            GL.glVertex3f( hx,  hy, -hz);

            // Top
            GL.glNormal3f(0, 1, 0);
            GL.glColor3f(r * 1.15f, g * 1.15f, b * 1.15f);
            GL.glVertex3f(-hx,  hy,  hz);
            GL.glVertex3f( hx,  hy,  hz);
            GL.glVertex3f( hx,  hy, -hz);
            GL.glVertex3f(-hx,  hy, -hz);

            // Bottom
            GL.glNormal3f(0, -1, 0);
            GL.glColor3f(r * 0.6f, g * 0.6f, b * 0.6f);
            GL.glVertex3f(-hx, -hy, -hz);
            GL.glVertex3f( hx, -hy, -hz);
            GL.glVertex3f( hx, -hy,  hz);
            GL.glVertex3f(-hx, -hy,  hz);

            // Left
            GL.glNormal3f(-1, 0, 0);
            GL.glColor3f(r * 0.85f, g * 0.85f, b * 0.85f);
            GL.glVertex3f(-hx, -hy, -hz);
            GL.glVertex3f(-hx, -hy,  hz);
            GL.glVertex3f(-hx,  hy,  hz);
            GL.glVertex3f(-hx,  hy, -hz);

            // Right
            GL.glNormal3f(1, 0, 0);
            GL.glColor3f(r * 0.95f, g * 0.95f, b * 0.95f);
            GL.glVertex3f( hx, -hy,  hz);
            GL.glVertex3f( hx, -hy, -hz);
            GL.glVertex3f( hx,  hy, -hz);
            GL.glVertex3f( hx,  hy,  hz);

            GL.glEnd();
            GL.glPopMatrix();
        }

        public static void DrawBuilding(float x, float z, float w, float h, float d, float r, float g, float b, bool isGlass = false)
        {
            // Base main structure
            DrawBox(x, 0, z, w, h, d, r, g, b);

            // Rooftop architectural trim
            DrawBox(x, h, z, w + 0.6f, 1.2f, d + 0.6f, r * 0.7f, g * 0.7f, b * 0.7f);

            // Window stripes
            if (!isGlass)
            {
                int floors = (int)(h / 4.0f);
                for (int f = 1; f < floors; f++)
                {
                    float y = f * 4.0f;
                    // Front window band
                    DrawBox(x, y, z + d * 0.5f + 0.05f, w * 0.8f, 1.4f, 0.1f, 0.9f, 0.95f, 1.0f);
                    // Back window band
                    DrawBox(x, y, z - d * 0.5f - 0.05f, w * 0.8f, 1.4f, 0.1f, 0.9f, 0.95f, 1.0f);
                }
            }
            else
            {
                // Cyber glass spire atop building
                DrawBox(x, h + 1.2f, z, w * 0.4f, 8.0f, d * 0.4f, 0.05f, 0.75f, 0.85f);
            }
        }

        public static void DrawRoad(float x1, float z1, float x2, float z2, float width)
        {
            float dx = x2 - x1;
            float dz = z2 - z1;
            float len = (float)Math.Sqrt(dx * dx + dz * dz);
            if (len < 0.001f) return;

            float nx = -dz / len * (width * 0.5f);
            float nz =  dx / len * (width * 0.5f);

            // Asphalt road surface
            GL.glColor3f(0.18f, 0.19f, 0.22f);
            GL.glBegin(GL.GL_QUADS);
            GL.glNormal3f(0, 1, 0);
            GL.glVertex3f(x1 - nx, 0.02f, z1 - nz);
            GL.glVertex3f(x1 + nx, 0.02f, z1 + nz);
            GL.glVertex3f(x2 + nx, 0.02f, z2 + nz);
            GL.glVertex3f(x2 - nx, 0.02f, z2 - nz);
            GL.glEnd();

            // Center yellow lane marking
            float clw = 0.25f;
            float cnx = -dz / len * clw;
            float cnz =  dx / len * clw;
            GL.glColor3f(0.95f, 0.85f, 0.1f);
            GL.glBegin(GL.GL_QUADS);
            GL.glNormal3f(0, 1, 0);
            GL.glVertex3f(x1 - cnx, 0.03f, z1 - cnz);
            GL.glVertex3f(x1 + cnx, 0.03f, z1 + cnz);
            GL.glVertex3f(x2 + cnx, 0.03f, z2 + cnz);
            GL.glVertex3f(x2 - cnx, 0.03f, z2 - cnz);
            GL.glEnd();
        }

        public static void DrawWater(float minX, float maxX, float minZ, float maxZ, float time)
        {
            GL.glEnable(GL.GL_BLEND);
            GL.glBlendFunc(GL.GL_SRC_ALPHA, GL.GL_ONE_MINUS_SRC_ALPHA);
            GL.glColor4f(0.04f, 0.22f, 0.38f, 0.88f);

            int segsX = 20;
            int segsZ = 20;
            float stepX = (maxX - minX) / segsX;
            float stepZ = (maxZ - minZ) / segsZ;

            GL.glBegin(GL.GL_QUADS);
            GL.glNormal3f(0, 1, 0);
            for (int i = 0; i < segsX; i++)
            {
                float xA = minX + i * stepX;
                float xB = xA + stepX;
                for (int j = 0; j < segsZ; j++)
                {
                    float zA = minZ + j * stepZ;
                    float zB = zA + stepZ;

                    float y1 = (float)Math.Sin(xA * 0.1f + time * 2.0f) * 0.2f - 0.2f;
                    float y2 = (float)Math.Sin(xB * 0.1f + time * 2.0f) * 0.2f - 0.2f;

                    GL.glVertex3f(xA, y1, zA);
                    GL.glVertex3f(xB, y2, zA);
                    GL.glVertex3f(xB, y2, zB);
                    GL.glVertex3f(xA, y1, zB);
                }
            }
            GL.glEnd();
            GL.glDisable(GL.GL_BLEND);
        }

        public static void DrawHumanoid(float x, float y, float z, float yaw, float walkCycle, float r, float g, float b, bool holdingGun = false)
        {
            GL.glPushMatrix();
            GL.glTranslatef(x, y, z);
            GL.glRotatef(-yaw * FastMath.RadToDeg + 180f, 0, 1, 0);

            float legSwing = (float)Math.Sin(walkCycle) * 0.35f;

            // Torso (Shirt)
            DrawBox(0, 0.85f, 0, 0.5f, 0.65f, 0.3f, r, g, b);

            // Head & Hair
            DrawBox(0, 1.55f, 0, 0.3f, 0.3f, 0.3f, 0.85f, 0.65f, 0.5f); // Skin
            DrawBox(0, 1.72f, -0.02f, 0.32f, 0.12f, 0.32f, 0.1f, 0.1f, 0.12f); // Black hair

            // Left Leg
            DrawBox(-0.15f, 0.42f + legSwing * 0.1f, legSwing, 0.18f, 0.85f, 0.2f, 0.15f, 0.2f, 0.35f); // Jeans
            // Right Leg
            DrawBox( 0.15f, 0.42f - legSwing * 0.1f, -legSwing, 0.18f, 0.85f, 0.2f, 0.15f, 0.2f, 0.35f);

            // Left Arm
            DrawBox(-0.35f, 0.85f - legSwing * 0.2f, -legSwing, 0.14f, 0.6f, 0.14f, r * 0.9f, g * 0.9f, b * 0.9f);

            // Right Arm (Aiming forward if holding gun)
            if (holdingGun)
            {
                DrawBox(0.35f, 1.0f, 0.25f, 0.14f, 0.14f, 0.6f, r * 0.9f, g * 0.9f, b * 0.9f);
                // Gun model
                DrawBox(0.35f, 1.02f, 0.6f, 0.08f, 0.12f, 0.35f, 0.15f, 0.15f, 0.18f); // Pistol/AK body
            }
            else
            {
                DrawBox(0.35f, 0.85f + legSwing * 0.2f, legSwing, 0.14f, 0.6f, 0.14f, r * 0.9f, g * 0.9f, b * 0.9f);
            }

            GL.glPopMatrix();
        }
    }
}

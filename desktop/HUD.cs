using System;

namespace MumbyeDesktop
{
    public static class HUD
    {
        public static void Render(int screenW, int screenH, Player player, World world, TrafficManager traffic, float fps)
        {
            // Switch to 2D Orthographic Projection
            GL.glMatrixMode(GL.GL_PROJECTION);
            GL.glPushMatrix();
            GL.glLoadIdentity();
            GL.glOrtho(0, screenW, screenH, 0, -1, 1);

            GL.glMatrixMode(GL.GL_MODELVIEW);
            GL.glPushMatrix();
            GL.glLoadIdentity();

            GL.glDisable(GL.GL_DEPTH_TEST);
            GL.glDisable(GL.GL_LIGHTING);
            GL.glEnable(GL.GL_BLEND);
            GL.glBlendFunc(GL.GL_SRC_ALPHA, GL.GL_ONE_MINUS_SRC_ALPHA);

            // 1. Health Bar (Bottom Left)
            float hpRatio = FastMath.Clamp(player.Health / 100f, 0, 1f);
            DrawRect(20, screenH - 50, 180, 16, 0.15f, 0.15f, 0.18f, 0.85f); // Background
            DrawRect(20, screenH - 50, 180 * hpRatio, 16, 0.15f, 0.85f, 0.25f, 0.95f); // Health Green

            // 2. Armor Bar
            float armorRatio = FastMath.Clamp(player.Armor / 100f, 0, 1f);
            DrawRect(20, screenH - 70, 180, 12, 0.15f, 0.15f, 0.18f, 0.85f);
            DrawRect(20, screenH - 70, 180 * armorRatio, 12, 0.15f, 0.65f, 0.95f, 0.95f); // Armor Blue

            // 3. Cash Counter (Top Right)
            DrawRect(screenW - 200, 20, 180, 36, 0.1f, 0.12f, 0.15f, 0.85f);
            DrawRect(screenW - 195, 25, 6, 26, 0.1f, 0.85f, 0.35f, 1.0f); // Green accent
            // Draw simulated cash bar
            DrawRect(screenW - 180, 32, 150, 12, 0.1f, 0.75f, 0.25f, 0.9f);

            // 4. Wanted Stars (Top Right under Cash)
            for (int s = 0; s < 5; s++)
            {
                float sx = screenW - 180 + s * 24;
                float sy = 68;
                bool isWanted = s < player.WantedLevel;
                float starCol = isWanted ? 0.98f : 0.25f;
                DrawRect(sx, sy, 18, 18, starCol, starCol * 0.85f, 0.05f, 0.9f);
            }

            // 5. Weapon Indicator (Bottom Right)
            DrawRect(screenW - 180, screenH - 65, 160, 45, 0.1f, 0.12f, 0.16f, 0.85f);
            int wIdx = (int)player.CurrentWeapon;
            int ammoCount = player.Ammo[wIdx];
            float ammoRatio = FastMath.Clamp(ammoCount / 120f, 0.1f, 1.0f);
            DrawRect(screenW - 170, screenH - 35, 140 * ammoRatio, 8, 0.98f, 0.65f, 0.08f, 0.95f);

            // 6. Speedometer (when inside vehicle)
            if (player.IsDriving && player.CurrentVehicle != null)
            {
                float speedKmh = Math.Abs(player.CurrentVehicle.Speed) * 3.6f;
                DrawRect(screenW * 0.5f - 80, screenH - 45, 160, 25, 0.1f, 0.12f, 0.15f, 0.85f);
                float speedRatio = FastMath.Clamp(speedKmh / 160f, 0, 1f);
                DrawRect(screenW * 0.5f - 75, screenH - 40, 150 * speedRatio, 15, 0.08f, 0.75f, 0.95f, 0.95f);
            }

            // 7. Reticle Crosshair (Center Screen on foot)
            if (!player.IsDriving)
            {
                float cx = screenW * 0.5f;
                float cy = screenH * 0.5f;
                DrawRect(cx - 8, cy - 1, 16, 2, 1.0f, 1.0f, 1.0f, 0.85f);
                DrawRect(cx - 1, cy - 8, 2, 16, 1.0f, 1.0f, 1.0f, 0.85f);
            }

            // 8. Circular Minimap (Bottom Left Above Health)
            RenderMinimap(20, screenH - 220, 140, 140, player, traffic);

            // Restore 3D State
            GL.glDisable(GL.GL_BLEND);
            GL.glEnable(GL.GL_LIGHTING);
            GL.glEnable(GL.GL_DEPTH_TEST);

            GL.glMatrixMode(GL.GL_PROJECTION);
            GL.glPopMatrix();
            GL.glMatrixMode(GL.GL_MODELVIEW);
            GL.glPopMatrix();
        }

        private static void RenderMinimap(float x, float y, float w, float h, Player player, TrafficManager traffic)
        {
            // Minimap background (Arabian Sea / Land)
            DrawRect(x, y, w, h, 0.12f, 0.15f, 0.18f, 0.92f);
            DrawRect(x, y, w, 2, 0.35f, 0.45f, 0.55f, 1.0f); // Top border
            DrawRect(x, y + h - 2, w, 2, 0.35f, 0.45f, 0.55f, 1.0f); // Bottom border
            DrawRect(x, y, 2, h, 0.35f, 0.45f, 0.55f, 1.0f); // Left border
            DrawRect(x + w - 2, y, 2, h, 0.35f, 0.45f, 0.55f, 1.0f); // Right border

            float mcx = x + w * 0.5f;
            float mcy = y + h * 0.5f;
            float mapScale = 0.42f;

            // Player blip (White Arrow)
            DrawRect(mcx - 3, mcy - 3, 6, 6, 1.0f, 1.0f, 1.0f, 1.0f);

            // Traffic vehicles blips (Cyan dots)
            for (int i = 0; i < traffic.Vehicles.Count; i++)
            {
                var v = traffic.Vehicles[i];
                if (v.IsPlayerDriving) continue;

                float relX = (v.Position.X - player.Position.X) * mapScale;
                float relZ = (v.Position.Z - player.Position.Z) * mapScale;

                float bx = mcx + relX;
                float by = mcy + relZ;

                if (bx > x + 4 && bx < x + w - 4 && by > y + 4 && by < y + h - 4)
                {
                    bool isPolice = v.Type == VehicleType.Police;
                    DrawRect(bx - 2, by - 2, 4, 4, isPolice ? 1.0f : 0.2f, isPolice ? 0.2f : 0.7f, 0.9f, 0.9f);
                }
            }
        }

        public static void DrawRect(float x, float y, float w, float h, float r, float g, float b, float a)
        {
            GL.glColor4f(r, g, b, a);
            GL.glBegin(GL.GL_QUADS);
            GL.glVertex2f(x, y);
            GL.glVertex2f(x + w, y);
            GL.glVertex2f(x + w, y + h);
            GL.glVertex2f(x, y + h);
            GL.glEnd();
        }
    }
}

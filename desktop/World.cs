using System;
using System.Collections.Generic;

namespace MumbyeDesktop
{
    public class BuildingDef
    {
        public float X, Z, W, H, D;
        public float R, G, B;
        public bool IsGlass;

        public BuildingDef(float x, float z, float w, float h, float d, float r, float g, float b, bool isGlass = false)
        {
            X = x; Z = z; W = w; H = h; D = d; R = r; G = g; B = b; IsGlass = isGlass;
        }

        public AABB GetAABB()
        {
            return new AABB(
                new Vector3(X - W * 0.5f, 0, Z - D * 0.5f),
                new Vector3(X + W * 0.5f, H, Z + D * 0.5f)
            );
        }
    }

    public class World
    {
        public List<BuildingDef> Buildings = new List<BuildingDef>();
        public List<AABB> Obstacles = new List<AABB>();

        public World()
        {
            GenerateCity();
        }

        private void GenerateCity()
        {
            // 1. South Mumbai: Heritage & Marine Drive Promenade
            AddBuilding(-45, -20, 16, 22, 16, 0.82f, 0.74f, 0.62f); // Art Deco Seafront
            AddBuilding(-45,  30, 18, 26, 16, 0.85f, 0.76f, 0.65f); // Marine Plaza
            AddBuilding(-45,  80, 16, 30, 18, 0.78f, 0.70f, 0.60f); // South Heritage

            // Gateway of India historic stone arch plaza (x: -20, z: 150)
            AddBuilding(-26, 150, 4, 18, 12, 0.76f, 0.62f, 0.42f);
            AddBuilding(-14, 150, 4, 18, 12, 0.76f, 0.62f, 0.42f);
            AddBuilding(-20, 150, 16, 6, 12, 0.76f, 0.62f, 0.42f); // Arch lintel

            // 2. Central Mumbai: Dadar Chawls & Markets
            for (int r = 0; r < 3; r++)
            {
                for (int c = 0; c < 2; c++)
                {
                    float cx = 40 + c * 24;
                    float cz = -80 + r * 30;
                    AddBuilding(cx, cz, 16, 15, 20, 0.85f, 0.55f, 0.35f); // Ochre Chawl blocks
                }
            }

            // Safehouse 1: Dadar Chawl Flat #4 (x: 55, z: 32)
            AddBuilding(55, 32, 14, 12, 16, 0.90f, 0.58f, 0.38f);

            // Safehouse 2: Bandra Sea-Breeze Villa & Bay (x: -35, z: -45)
            AddBuilding(-35, -45, 18, 14, 18, 0.92f, 0.90f, 0.85f);

            // 3. East Mumbai: BKC Cyber City Financial Hub (Gleaming glass skyscrapers)
            AddBuilding(220, -100, 24, 75, 24, 0.15f, 0.35f, 0.55f, true); // AstraCorp Tower 1
            AddBuilding(240,  -60, 28, 92, 28, 0.12f, 0.42f, 0.65f, true); // AstraCorp HQ & Helipad
            AddBuilding(260,  -90, 22, 68, 22, 0.18f, 0.32f, 0.50f, true); // Stock Exchange Cyber Tower
            AddBuilding(230,  -20, 26, 58, 24, 0.14f, 0.38f, 0.58f, true); // BKC Cyber Hub

            // 4. Colaba Docks: Cargo Shipping Warehouses & Cranes (x: 240, z: 120)
            AddBuilding(220, 110, 35, 12, 22, 0.45f, 0.48f, 0.52f); // Metal Freight Shed
            AddBuilding(220, 145, 35, 12, 22, 0.42f, 0.46f, 0.50f); // Storage Depot
        }

        private void AddBuilding(float x, float z, float w, float h, float d, float r, float g, float b, bool isGlass = false)
        {
            var bld = new BuildingDef(x, z, w, h, d, r, g, b, isGlass);
            Buildings.Add(bld);
            Obstacles.Add(bld.GetAABB());
        }

        public void Render(float time)
        {
            // Ground Island Base (City Soil)
            Renderer.DrawBox(100, -0.5f, 0, 360, 1.0f, 400, 0.22f, 0.24f, 0.27f);

            // Arabian Sea (West of x = -60)
            Renderer.DrawWater(-300, -60, -300, 300, time);

            // Marine Drive Promenade Promenade Walkway (x = -60 to -54)
            Renderer.DrawBox(-57, 0.05f, 0, 6, 0.1f, 380, 0.72f, 0.70f, 0.65f); // Paved concrete
            Renderer.DrawBox(-60, 0.25f, 0, 0.6f, 0.5f, 380, 0.85f, 0.85f, 0.85f); // Sea Wall Barrier

            // Main Arterial Roadways (North-South)
            Renderer.DrawRoad(-50, -180, -50, 180, 12.0f); // Marine Drive West Expressway
            Renderer.DrawRoad( 20, -180,  20, 180, 12.0f); // Central Dadar Avenue
            Renderer.DrawRoad( 90, -180,  90, 180, 12.0f); // Chor Bazaar Boulevard
            Renderer.DrawRoad(160, -180, 160, 180, 12.0f); // Eastern Freeway Link
            Renderer.DrawRoad(240, -180, 240, 180, 14.0f); // BKC Cyber Expressway

            // Horizontal Crossings (East-West)
            Renderer.DrawRoad(-50, -120, 240, -120, 11.0f);
            Renderer.DrawRoad(-50,  -60, 240,  -60, 11.0f);
            Renderer.DrawRoad(-50,    0, 240,    0, 11.0f);
            Renderer.DrawRoad(-50,   60, 240,   60, 11.0f);
            Renderer.DrawRoad(-50,  120, 240,  120, 11.0f);

            // Bandra-Worli Sea Link 4-Lane Cable Suspension Bridge (x = -50, z = -140 to -340)
            Renderer.DrawRoad(-50, -140, -50, -340, 14.0f);
            // Bridge Pylons (Towering Diamond Cable Supports)
            Renderer.DrawBox(-50, 22.0f, -200, 2.0f, 44.0f, 2.0f, 0.95f, 0.95f, 0.98f);
            Renderer.DrawBox(-50, 22.0f, -270, 2.0f, 44.0f, 2.0f, 0.95f, 0.95f, 0.98f);

            // Suburban Railway Track Corridor (CST to Dadar)
            Renderer.DrawBox(40, 0.05f, 0, 3.5f, 0.1f, 360, 0.35f, 0.28f, 0.20f); // Ballast bed
            // Steel rails
            Renderer.DrawBox(39.2f, 0.12f, 0, 0.2f, 0.15f, 360, 0.65f, 0.65f, 0.68f);
            Renderer.DrawBox(40.8f, 0.12f, 0, 0.2f, 0.15f, 360, 0.65f, 0.65f, 0.68f);

            // Render all buildings
            for (int i = 0; i < Buildings.Count; i++)
            {
                var b = Buildings[i];
                Renderer.DrawBuilding(b.X, b.Z, b.W, b.H, b.D, b.R, b.G, b.B, b.IsGlass);
            }

            // Vada Pav Stalls (x: -48, z: -10) and (x: 22, z: 25)
            DrawVadaPavStall(-48, -10);
            DrawVadaPavStall( 22,  25);
        }

        private void DrawVadaPavStall(float x, float z)
        {
            // Stall cart body
            Renderer.DrawBox(x, 0.4f, z, 2.4f, 0.8f, 1.4f, 0.85f, 0.25f, 0.15f); // Red cart
            // Saffron canopy roof
            Renderer.DrawBox(x, 1.8f, z, 2.8f, 0.2f, 1.8f, 0.98f, 0.62f, 0.08f);
            // Counter top
            Renderer.DrawBox(x, 0.82f, z, 2.5f, 0.08f, 1.5f, 0.90f, 0.90f, 0.90f);
        }

        public bool CheckCollision(Vector3 pos, float radius)
        {
            for (int i = 0; i < Obstacles.Count; i++)
            {
                var box = Obstacles[i];
                if (pos.X + radius > box.Min.X && pos.X - radius < box.Max.X &&
                    pos.Z + radius > box.Min.Z && pos.Z - radius < box.Max.Z &&
                    pos.Y < box.Max.Y && pos.Y + 1.8f > box.Min.Y)
                {
                    return true;
                }
            }
            return false;
        }
    }
}

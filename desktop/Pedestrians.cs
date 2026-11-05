using System;
using System.Collections.Generic;

namespace MumbyeDesktop
{
    public class Pedestrian
    {
        public Vector3 Position;
        public float Yaw;
        public float WalkCycle;
        public float Speed;
        public float R, G, B;
        public bool IsDead;

        public Pedestrian(Vector3 pos, float yaw, float r, float g, float b)
        {
            Position = pos;
            Yaw = yaw;
            WalkCycle = 0;
            Speed = 1.8f;
            R = r; G = g; B = b;
            IsDead = false;
        }

        public void Update(float delta, World world)
        {
            if (IsDead) return;

            WalkCycle += delta * 7f;
            float fx = (float)Math.Sin(Yaw);
            float fz = (float)Math.Cos(Yaw);
            Vector3 nextPos = Position + new Vector3(fx, 0, fz) * (Speed * delta);

            if (!world.CheckCollision(nextPos, 0.4f))
            {
                Position = nextPos;
            }
            else
            {
                // Turn around on hitting wall/corner
                Yaw += (float)Math.PI * 0.5f;
            }

            // Boundary wrap around city
            if (Position.Z > 170) Yaw = (float)Math.PI;
            if (Position.Z < -170) Yaw = 0;
        }

        public void Render()
        {
            if (IsDead)
            {
                // Lying flat on road
                Renderer.DrawBox(Position.X, 0.1f, Position.Z, 0.6f, 0.2f, 1.6f, R * 0.7f, G * 0.7f, B * 0.7f);
                return;
            }

            Renderer.DrawHumanoid(Position.X, Position.Y, Position.Z, Yaw, WalkCycle, R, G, B, false);
        }
    }

    public class PedestrianManager
    {
        public List<Pedestrian> Pedestrians = new List<Pedestrian>();

        public PedestrianManager()
        {
            SpawnAmbientPedestrians();
        }

        private void SpawnAmbientPedestrians()
        {
            float[][] colors = new float[][] {
                new float[] { 0.95f, 0.45f, 0.15f }, // Saffron kurti
                new float[] { 0.15f, 0.65f, 0.45f }, // Emerald green
                new float[] { 0.85f, 0.85f, 0.85f }, // Crisp white shirt
                new float[] { 0.92f, 0.22f, 0.45f }, // Pink salwar
                new float[] { 0.25f, 0.45f, 0.85f }  // Royal blue
            };

            // Sidewalk spawns along Marine Drive and Dadar
            for (int i = 0; i < 25; i++)
            {
                float z = -140f + i * 12f;
                float x = (i % 2 == 0) ? -56f : -44f;
                float[] col = colors[i % colors.Length];
                Pedestrians.Add(new Pedestrian(new Vector3(x, 0, z), (i % 2 == 0) ? 0 : (float)Math.PI, col[0], col[1], col[2]));
            }
        }

        public void Update(float delta, World world)
        {
            for (int i = 0; i < Pedestrians.Count; i++)
            {
                Pedestrians[i].Update(delta, world);
            }
        }

        public void Render()
        {
            for (int i = 0; i < Pedestrians.Count; i++)
            {
                Pedestrians[i].Render();
            }
        }
    }
}

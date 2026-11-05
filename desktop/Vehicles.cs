using System;

namespace MumbyeDesktop
{
    public enum VehicleType
    {
        Taxi,
        Auto,
        Supercar,
        Police,
        Speedboat
    }

    public class Vehicle
    {
        public Vector3 Position;
        public float Yaw;
        public float Pitch;
        public float Speed;
        public float MaxSpeed;
        public float Acceleration;
        public float TurnSpeed;
        public VehicleType Type;
        public bool IsPlayerDriving;
        public bool IsDestroyed;
        public float Health;
        public float SirensTimer;

        public Vehicle(Vector3 pos, float yaw, VehicleType type)
        {
            Position = pos;
            Yaw = yaw;
            Type = type;
            Speed = 0;
            Health = 100f;
            IsPlayerDriving = false;
            IsDestroyed = false;

            switch (type)
            {
                case VehicleType.Taxi:
                    MaxSpeed = 26f;
                    Acceleration = 18f;
                    TurnSpeed = 2.4f;
                    break;
                case VehicleType.Auto:
                    MaxSpeed = 20f;
                    Acceleration = 22f;
                    TurnSpeed = 3.6f;
                    break;
                case VehicleType.Supercar:
                    MaxSpeed = 42f;
                    Acceleration = 28f;
                    TurnSpeed = 2.8f;
                    break;
                case VehicleType.Police:
                    MaxSpeed = 32f;
                    Acceleration = 24f;
                    TurnSpeed = 2.6f;
                    break;
                case VehicleType.Speedboat:
                    MaxSpeed = 36f;
                    Acceleration = 20f;
                    TurnSpeed = 2.2f;
                    break;
            }
        }

        public void Update(float delta, World world, bool accel, bool brake, bool steerLeft, bool steerRight, bool handbrake)
        {
            if (IsDestroyed) return;

            SirensTimer += delta * 8f;

            if (accel)
            {
                Speed = Math.Min(MaxSpeed, Speed + Acceleration * delta);
            }
            else if (brake)
            {
                Speed = Math.Max(-MaxSpeed * 0.4f, Speed - Acceleration * 1.5f * delta);
            }
            else
            {
                // Engine friction / coasting
                if (Speed > 0) Speed = Math.Max(0, Speed - 12f * delta);
                else if (Speed < 0) Speed = Math.Min(0, Speed + 12f * delta);
            }

            if (handbrake)
            {
                Speed = FastMath.Lerp(Speed, 0, delta * 4f);
            }

            // Steering (only when moving)
            float speedRatio = Math.Abs(Speed) / MaxSpeed;
            if (Math.Abs(Speed) > 0.5f)
            {
                float dir = Speed > 0 ? 1f : -1f;
                if (steerLeft)  Yaw += TurnSpeed * delta * dir * (0.6f + speedRatio * 0.4f);
                if (steerRight) Yaw -= TurnSpeed * delta * dir * (0.6f + speedRatio * 0.4f);
            }

            // Velocity calculation
            float forwardX = (float)Math.Sin(Yaw);
            float forwardZ = (float)Math.Cos(Yaw);
            Vector3 nextPos = Position + new Vector3(forwardX, 0, forwardZ) * (Speed * delta);

            // Ground height constraint
            if (Type == VehicleType.Speedboat)
            {
                nextPos.Y = -0.3f + (float)Math.Sin(nextPos.X * 0.1f + SirensTimer * 0.5f) * 0.15f;
            }
            else
            {
                nextPos.Y = 0f;
            }

            // World collision check
            if (!world.CheckCollision(nextPos, 1.4f))
            {
                Position = nextPos;
            }
            else
            {
                // Hit building/barrier: bounce & take minor damage
                Speed = -Speed * 0.35f;
                Health -= Math.Abs(Speed) * 0.5f;
                if (Health <= 0) IsDestroyed = true;
            }
        }

        public void Render()
        {
            GL.glPushMatrix();
            GL.glTranslatef(Position.X, Position.Y, Position.Z);
            GL.glRotatef(Yaw * FastMath.RadToDeg, 0, 1, 0);

            if (Type == VehicleType.Taxi)
            {
                // Kaali-Peeli Taxi (Lower black body, yellow roof)
                Renderer.DrawBox(0, 0.4f, 0, 1.8f, 0.5f, 3.8f, 0.12f, 0.12f, 0.12f); // Black lower
                Renderer.DrawBox(0, 0.9f, -0.2f, 1.6f, 0.55f, 2.0f, 0.98f, 0.82f, 0.08f); // Iconic Yellow roof
                // Windows
                Renderer.DrawBox(0, 0.92f, 0.85f, 1.5f, 0.45f, 0.1f, 0.2f, 0.25f, 0.3f); // Windshield
                // Wheels
                DrawWheels(0.85f, 1.2f);
            }
            else if (Type == VehicleType.Auto)
            {
                // Mumbai Auto Rickshaw (Yellow roof, green/black body, single front wheel)
                Renderer.DrawBox(0, 0.45f, 0, 1.4f, 0.6f, 2.6f, 0.12f, 0.48f, 0.22f); // Green body
                Renderer.DrawBox(0, 1.15f, 0.1f, 1.35f, 0.7f, 2.2f, 0.96f, 0.78f, 0.08f); // Yellow hood
                // Wheels (3 wheels)
                Renderer.DrawBox(0, 0.25f, 1.0f, 0.25f, 0.5f, 0.5f, 0.1f, 0.1f, 0.1f); // Front wheel
                Renderer.DrawBox(-0.65f, 0.25f, -0.7f, 0.25f, 0.5f, 0.5f, 0.1f, 0.1f, 0.1f); // Rear L
                Renderer.DrawBox( 0.65f, 0.25f, -0.7f, 0.25f, 0.5f, 0.5f, 0.1f, 0.1f, 0.1f); // Rear R
            }
            else if (Type == VehicleType.Supercar)
            {
                // Bollywood Supercar (Sleek red, aerodynamic wedge)
                Renderer.DrawBox(0, 0.32f, 0, 2.0f, 0.42f, 4.4f, 0.92f, 0.12f, 0.15f); // Red body
                Renderer.DrawBox(0, 0.65f, -0.3f, 1.6f, 0.35f, 2.0f, 0.15f, 0.15f, 0.18f); // Tinted canopy
                // Rear spoiler
                Renderer.DrawBox(0, 0.85f, -1.9f, 1.8f, 0.08f, 0.4f, 0.1f, 0.1f, 0.1f);
                DrawWheels(0.95f, 1.5f);
            }
            else if (Type == VehicleType.Police)
            {
                // Metro Security Patrol Car
                Renderer.DrawBox(0, 0.45f, 0, 1.9f, 0.55f, 4.0f, 0.95f, 0.95f, 0.98f); // White body
                Renderer.DrawBox(0, 0.55f, 0, 1.92f, 0.22f, 3.8f, 0.15f, 0.35f, 0.85f); // Blue police stripe
                Renderer.DrawBox(0, 0.95f, -0.2f, 1.6f, 0.5f, 2.0f, 0.15f, 0.15f, 0.18f); // Cabin
                // Flashing emergency light bar
                bool redFlash = (int)SirensTimer % 2 == 0;
                Renderer.DrawBox(-0.35f, 1.25f, -0.2f, 0.4f, 0.18f, 0.3f, redFlash ? 1.0f : 0.2f, 0.1f, 0.1f); // Red
                Renderer.DrawBox( 0.35f, 1.25f, -0.2f, 0.4f, 0.18f, 0.3f, 0.1f, 0.2f, redFlash ? 0.2f : 1.0f); // Blue
                DrawWheels(0.9f, 1.3f);
            }
            else if (Type == VehicleType.Speedboat)
            {
                // Speedboat hull & windshield
                Renderer.DrawBox(0, 0.4f, 0, 2.2f, 0.6f, 5.0f, 0.95f, 0.95f, 0.98f); // White hull
                Renderer.DrawBox(0, 0.55f, 0, 2.25f, 0.15f, 4.8f, 0.08f, 0.55f, 0.85f); // Cyan stripe
                Renderer.DrawBox(0, 0.85f, 0.8f, 1.8f, 0.4f, 0.15f, 0.2f, 0.3f, 0.4f); // Windshield
            }

            GL.glPopMatrix();
        }

        private void DrawWheels(float halfW, float halfL)
        {
            Renderer.DrawBox(-halfW, 0.25f,  halfL, 0.25f, 0.5f, 0.5f, 0.1f, 0.1f, 0.12f); // Front L
            Renderer.DrawBox( halfW, 0.25f,  halfL, 0.25f, 0.5f, 0.5f, 0.1f, 0.1f, 0.12f); // Front R
            Renderer.DrawBox(-halfW, 0.25f, -halfL, 0.25f, 0.5f, 0.5f, 0.1f, 0.1f, 0.12f); // Rear L
            Renderer.DrawBox( halfW, 0.25f, -halfL, 0.25f, 0.5f, 0.5f, 0.1f, 0.1f, 0.12f); // Rear R
        }
    }
}

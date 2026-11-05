using System;

namespace MumbyeDesktop
{
    public enum WeaponType
    {
        Fists,
        Pistol,
        Shotgun,
        AK47,
        RocketLauncher
    }

    public class Player
    {
        public Vector3 Position;
        public Vector3 Velocity;
        public float Yaw;
        public float Pitch;
        public float WalkCycle;

        public float Health;
        public float Armor;
        public int Cash;
        public int WantedLevel;

        public bool IsDriving;
        public Vehicle CurrentVehicle;

        public WeaponType CurrentWeapon;
        public int[] Ammo;
        public float FireCooldown;
        public float MuzzleFlashTimer;

        public Player()
        {
            Respawn(-45f, 10f);
        }

        public void Respawn(float x, float z)
        {
            Position = new Vector3(x, 0, z);
            Velocity = Vector3.Zero;
            Yaw = 0;
            Pitch = 0.2f;
            Health = 100f;
            Armor = 100f;
            Cash = 10250;
            WantedLevel = 0;
            IsDriving = false;
            CurrentVehicle = null;

            CurrentWeapon = WeaponType.Pistol;
            Ammo = new int[] { 9999, 120, 48, 240, 15 };
            FireCooldown = 0;
            MuzzleFlashTimer = 0;
        }

        public void Update(float delta, World world, bool moveF, bool moveB, bool moveL, bool moveR, bool sprint, bool jump, bool fire, Vehicle nearestVehicle, bool interactJustPressed)
        {
            MuzzleFlashTimer = Math.Max(0, MuzzleFlashTimer - delta);
            FireCooldown = Math.Max(0, FireCooldown - delta);

            // Handle Vehicle Enter / Exit
            if (interactJustPressed)
            {
                if (IsDriving && CurrentVehicle != null)
                {
                    // Exit vehicle
                    IsDriving = false;
                    Position = CurrentVehicle.Position + new Vector3(-2.2f, 0, 0);
                    CurrentVehicle.IsPlayerDriving = false;
                    CurrentVehicle = null;
                }
                else if (!IsDriving && nearestVehicle != null && Vector3.Distance(Position, nearestVehicle.Position) < 4.0f)
                {
                    // Enter vehicle
                    IsDriving = true;
                    CurrentVehicle = nearestVehicle;
                    nearestVehicle.IsPlayerDriving = true;
                }
            }

            if (IsDriving && CurrentVehicle != null)
            {
                Position = CurrentVehicle.Position;
                Yaw = CurrentVehicle.Yaw;
                return;
            }

            // On-Foot Movement Physics
            float moveSpeed = sprint ? 8.5f : 4.5f;
            Vector3 wishDir = Vector3.Zero;

            float sinY = (float)Math.Sin(Yaw);
            float cosY = (float)Math.Cos(Yaw);

            if (moveF) wishDir += new Vector3( sinY, 0,  cosY);
            if (moveB) wishDir += new Vector3(-sinY, 0, -cosY);
            if (moveL) wishDir += new Vector3( cosY, 0, -sinY);
            if (moveR) wishDir += new Vector3(-cosY, 0,  sinY);

            if (wishDir.LengthSquared() > 0.001f)
            {
                wishDir = wishDir.Normalized();
                WalkCycle += delta * (sprint ? 16f : 9f);
            }
            else
            {
                WalkCycle = 0;
            }

            // Horizontal velocity
            Velocity.X = wishDir.X * moveSpeed;
            Velocity.Z = wishDir.Z * moveSpeed;

            // Gravity & Jump
            if (Position.Y <= 0.01f)
            {
                Position.Y = 0;
                Velocity.Y = 0;
                if (jump)
                {
                    Velocity.Y = 6.2f;
                }
            }
            else
            {
                Velocity.Y -= 18.0f * delta; // Gravity
            }

            Vector3 nextPos = Position + Velocity * delta;
            if (nextPos.Y < 0) nextPos.Y = 0;

            // Collision check against world obstacles
            if (!world.CheckCollision(new Vector3(nextPos.X, Position.Y, Position.Z), 0.45f))
            {
                Position.X = nextPos.X;
            }
            if (!world.CheckCollision(new Vector3(Position.X, Position.Y, nextPos.Z), 0.45f))
            {
                Position.Z = nextPos.Z;
            }
            Position.Y = nextPos.Y;

            // Firing weapon
            if (fire && FireCooldown <= 0)
            {
                FireWeapon();
            }
        }

        private void FireWeapon()
        {
            int wIdx = (int)CurrentWeapon;
            if (Ammo[wIdx] <= 0 && CurrentWeapon != WeaponType.Fists) return;

            if (CurrentWeapon != WeaponType.Fists)
            {
                Ammo[wIdx]--;
            }

            MuzzleFlashTimer = 0.08f;
            FireCooldown = CurrentWeapon == WeaponType.AK47 ? 0.12f :
                          CurrentWeapon == WeaponType.Shotgun ? 0.75f :
                          CurrentWeapon == WeaponType.RocketLauncher ? 1.4f : 0.28f;
        }

        public void CycleWeapon()
        {
            CurrentWeapon = (WeaponType)(((int)CurrentWeapon + 1) % 5);
        }

        public void Render()
        {
            if (IsDriving) return; // Hidden while inside car cabin

            // Render 3D player mesh
            Renderer.DrawHumanoid(
                Position.X, Position.Y, Position.Z,
                Yaw, WalkCycle,
                0.22f, 0.45f, 0.85f, // Blue jacket
                CurrentWeapon != WeaponType.Fists
            );

            // Render muzzle flash
            if (MuzzleFlashTimer > 0)
            {
                float fx = Position.X + (float)Math.Sin(Yaw) * 0.9f;
                float fz = Position.Z + (float)Math.Cos(Yaw) * 0.9f;
                Renderer.DrawBox(fx, Position.Y + 1.0f, fz, 0.25f, 0.25f, 0.25f, 1.0f, 0.85f, 0.1f);
            }
        }
    }
}

using System;
using System.Collections.Generic;

namespace MumbyeDesktop
{
    public class TrafficManager
    {
        public List<Vehicle> Vehicles = new List<Vehicle>();

        public TrafficManager()
        {
            SpawnInitialTraffic();
        }

        private void SpawnInitialTraffic()
        {
            // Marine Drive North-South traffic (x = -50)
            Vehicles.Add(new Vehicle(new Vector3(-48f, 0, -80f), 0, VehicleType.Taxi));
            Vehicles.Add(new Vehicle(new Vector3(-52f, 0, -20f), (float)Math.PI, VehicleType.Auto));
            Vehicles.Add(new Vehicle(new Vector3(-48f, 0,  40f), 0, VehicleType.Supercar));
            Vehicles.Add(new Vehicle(new Vector3(-52f, 0, 100f), (float)Math.PI, VehicleType.Taxi));

            // Central Dadar Avenue traffic (x = 20)
            Vehicles.Add(new Vehicle(new Vector3(22f, 0, -60f), 0, VehicleType.Auto));
            Vehicles.Add(new Vehicle(new Vector3(18f, 0,   0f), (float)Math.PI, VehicleType.Taxi));
            Vehicles.Add(new Vehicle(new Vector3(22f, 0,  80f), 0, VehicleType.Auto));

            // BKC Cyber City Traffic (x = 240)
            Vehicles.Add(new Vehicle(new Vector3(242f, 0, -80f), 0, VehicleType.Supercar));
            Vehicles.Add(new Vehicle(new Vector3(238f, 0,  20f), (float)Math.PI, VehicleType.Police));

            // Colaba Maritime Harbor Speedboats (Water at x = -75, z = -10)
            Vehicles.Add(new Vehicle(new Vector3(-75f, -0.3f, -10f), 0, VehicleType.Speedboat));
        }

        public void Update(float delta, World world, Player player)
        {
            for (int i = 0; i < Vehicles.Count; i++)
            {
                var v = Vehicles[i];
                if (v.IsPlayerDriving)
                {
                    // Controlled by player input in main loop
                    continue;
                }

                // Simple ambient cruising AI
                v.Update(delta, world, true, false, false, false, false);

                // Waypoint loop / boundary wrapping
                if (v.Position.Z > 175)
                {
                    v.Position.Z = -175;
                }
                else if (v.Position.Z < -175)
                {
                    v.Position.Z = 175;
                }
            }
        }

        public void Render()
        {
            for (int i = 0; i < Vehicles.Count; i++)
            {
                Vehicles[i].Render();
            }
        }

        public Vehicle GetNearestVehicle(Vector3 pos)
        {
            Vehicle nearest = null;
            float minDist = float.MaxValue;
            for (int i = 0; i < Vehicles.Count; i++)
            {
                float d = Vector3.Distance(pos, Vehicles[i].Position);
                if (d < minDist)
                {
                    minDist = d;
                    nearest = Vehicles[i];
                }
            }
            return nearest;
        }
    }
}

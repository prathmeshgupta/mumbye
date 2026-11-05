using System;

namespace MumbyeDesktop
{
    public struct Vector3
    {
        public float X;
        public float Y;
        public float Z;

        public Vector3(float x, float y, float z)
        {
            X = x;
            Y = y;
            Z = z;
        }

        public static Vector3 Zero { get { return new Vector3(0, 0, 0); } }
        public static Vector3 Up { get { return new Vector3(0, 1, 0); } }

        public static Vector3 operator +(Vector3 a, Vector3 b) { return new Vector3(a.X + b.X, a.Y + b.Y, a.Z + b.Z); }
        public static Vector3 operator -(Vector3 a, Vector3 b) { return new Vector3(a.X - b.X, a.Y - b.Y, a.Z - b.Z); }
        public static Vector3 operator *(Vector3 a, float d) { return new Vector3(a.X * d, a.Y * d, a.Z * d); }
        public static Vector3 operator /(Vector3 a, float d) { return new Vector3(a.X / d, a.Y / d, a.Z / d); }

        public float Length()
        {
            return (float)Math.Sqrt(X * X + Y * Y + Z * Z);
        }

        public float LengthSquared()
        {
            return X * X + Y * Y + Z * Z;
        }

        public Vector3 Normalized()
        {
            float len = Length();
            if (len > 0.00001f) return new Vector3(X / len, Y / len, Z / len);
            return new Vector3(0, 0, 0);
        }

        public static float Distance(Vector3 a, Vector3 b)
        {
            return (a - b).Length();
        }

        public static float DistanceSquared(Vector3 a, Vector3 b)
        {
            return (a - b).LengthSquared();
        }

        public static float Dot(Vector3 a, Vector3 b)
        {
            return a.X * b.X + a.Y * b.Y + a.Z * b.Z;
        }

        public static Vector3 Cross(Vector3 a, Vector3 b)
        {
            return new Vector3(
                a.Y * b.Z - a.Z * b.Y,
                a.Z * b.X - a.X * b.Z,
                a.X * b.Y - a.Y * b.X
            );
        }

        public static Vector3 Lerp(Vector3 a, Vector3 b, float t)
        {
            t = Math.Max(0f, Math.Min(1f, t));
            return new Vector3(a.X + (b.X - a.X) * t, a.Y + (b.Y - a.Y) * t, a.Z + (b.Z - a.Z) * t);
        }
    }

    public struct AABB
    {
        public Vector3 Min;
        public Vector3 Max;

        public AABB(Vector3 min, Vector3 max)
        {
            Min = min;
            Max = max;
        }

        public bool Intersects(AABB other)
        {
            return (Min.X <= other.Max.X && Max.X >= other.Min.X) &&
                   (Min.Y <= other.Max.Y && Max.Y >= other.Min.Y) &&
                   (Min.Z <= other.Max.Z && Max.Z >= other.Min.Z);
        }

        public bool Contains(Vector3 pt)
        {
            return pt.X >= Min.X && pt.X <= Max.X &&
                   pt.Y >= Min.Y && pt.Y <= Max.Y &&
                   pt.Z >= Min.Z && pt.Z <= Max.Z;
        }
    }

    public static class FastMath
    {
        public const float DegToRad = (float)(Math.PI / 180.0);
        public const float RadToDeg = (float)(180.0 / Math.PI);

        public static float Clamp(float val, float min, float max)
        {
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

        public static float Lerp(float a, float b, float t)
        {
            return a + (b - a) * Clamp(t, 0f, 1f);
        }
    }
}

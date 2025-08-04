import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Register() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    console.log("Submit", form);

    try {
      await axios.request({
        url: "/api/user/register",
        method: "post",
        data: {
          username: form.username,
          email: form.email,
          password: form.password,
        },
      });

      await axios.request({
        url: "/api/auth/login",
        method: "post",
        data: {
          email: form.email,
          password: form.password,
        },
      });

      toast.success("register success");
      navigate("/todo");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || "Something went wrong";
        setError(msg);
      } else {
        alert("Unexpected error");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 back-button"
      >
        ← Back
      </button>
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="subheading mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="content">Username</p>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md placeholder"
              required
            />
          </div>
          <div className="space-y-2">
            <p className="content">Email</p>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md placeholder"
              required
            />
          </div>
          <div className="space-y-2">
            <p className="content">Password</p>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md placeholder"
              required
            />
          </div>
          <div className="space-y-2">
            <p className="content">Confirm Password</p>
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm your password"
              value={form.confirm_password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md placeholder"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <button type="submit" className="my-4 w-full yellow-button">
            Register
          </button>
        </form>
        <button
          className="w-full text-button"
          onClick={() => navigate("/login")}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}

export default Register;

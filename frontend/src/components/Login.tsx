import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submit", form);

    axios
      .request({
        url: "/api/auth/login",
        method: "post",
        data: form,
      })
      .then(() => {
        navigate("/todo");
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError("Wrong email or password.");
        } else {
          alert("Unexpected error");
        }
      });
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
        <h2 className="subheading mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="my-4 w-full yellow-button">
            Login
          </button>
          <button
            className="w-full text-button"
            onClick={() => navigate("/register")}
          >
            Don't have an account? Sign up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

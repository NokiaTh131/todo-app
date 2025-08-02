import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row h-screen">
      <div className="basis-1/2">
        <img
          src="/todo-list-logo.png"
          alt="Logo"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="basis-1/2 flex flex-col items-center justify-center">
        <div>
          <h1 className="my-5 heading">Awesome TodoList App</h1>
          <p className="my-5 content max-w-lg">
            จัดการงานของคุณได้ง่ายและรวดเร็ว ด้วย Awesome TodoList App!
            แอปนี้ช่วยให้คุณสร้างรายการงานที่ต้องทำได้อย่างมีประสิทธิภาพ เพิ่ม
            ลบ แก้ไข และติดตามสถานะงานของคุณได้
            ด้วยอินเทอร์เฟซที่ใช้งานง่ายและเรียบง่าย ให้คุณไม่พลาดทุกงานสำคัญ
          </p>
          <button
            className="w-full yellow-button"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
          <button
            className="w-full text-button"
            onClick={() => navigate("/login")}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

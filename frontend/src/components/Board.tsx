import axios from "axios";
import type { Board, User } from "../types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TodoList() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>();
  const [newBoard, setNewBoard] = useState({
    name: "",
    description: "",
    background_color: "",
  });
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board>();
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBoard({ ...newBoard, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const profile_res = await axios.get<User>("api/user/profile");
    const board_res = await axios.get<Board[]>("api/board");
    setUser(profile_res.data);
    setBoards(board_res.data);
  }

  function createBoard() {
    setNewBoard({
      name: "",
      description: "",
      background_color: "",
    });
    setShowModal(false);
  }

  function handleSubmit() {
    axios
      .request({
        url: "/api/board",
        method: "post",
        data: newBoard,
      })
      .then(() => {
        fetchData();
      })
      .catch((err) => alert(err));
  }

  function handleLogout() {
    axios
      .request({
        url: "/api/auth/logout",
        method: "post",
      })
      .then(() => navigate("/"))
      .catch((err) => alert(err));
  }

  return (
    <div>
      <div className="flex flex-row h-screen bg-gray-50 ">
        <div className="basis-1/5 bg-gray-700 flex flex-col">
          <h1 className="mx-2 my-3 p-3 subheading text-gray-200 text-left border-b border-gray-500">
            My Board
          </h1>
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => setCurrentBoard(board)}
              className={`w-full text-left px-10 py-2 cursor-pointer text-gray-200 ${
                currentBoard?.id === board.id
                  ? "bg-gray-600"
                  : "hover:bg-gray-600"
              }`}
            >
              {board.name}
            </button>
          ))}
          <button
            className="w-full text-gray-200 text-left px-8 py-2 hover:bg-gray-500 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            + Create new board
          </button>
          <div className="mt-auto p-5 border-t border-gray-600 bg-gray-400 flex items-center space-x-4">
            <img
              src="/monkey.png"
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{user?.username}</p>
              <button
                onClick={() => {
                  handleLogout();
                }}
                className="text-button"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/25 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-lg font-bold mb-4">Create new board</h2>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={newBoard.name}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={newBoard.description}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => createBoard()}
                  className="px-4 py-2 gray-button"
                >
                  cancel
                </button>
                <button
                  onClick={() => {
                    handleSubmit();
                    setShowModal(false);
                  }}
                  className="px-4 py-2 yellow-button"
                >
                  create
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="basis-4/5"></div>
      </div>
    </div>
  );
}

export default TodoList;

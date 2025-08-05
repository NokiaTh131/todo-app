import axios from "axios";
import type { Board, User } from "../types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListComponent from "./ListComponent";
import { toast } from "sonner";

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
  const [modal, setModal] = useState({
    title: "Create new board",
    button: "Create",
    show: false,
  });

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

  function clearNewBoard() {
    setNewBoard({
      name: "",
      description: "",
      background_color: "",
    });
    setModal((prev) => ({
      ...prev,
      show: false,
    }));
  }

  function updateBoard(board: Board) {
    setNewBoard({
      name: board.name,
      description: board.description,
      background_color: "",
    });
    setModal({
      title: `Update ${board.name} board`,
      button: "Update",
      show: true,
    });
  }

  function deleteBoard(board: Board) {
    axios
      .request({
        url: `/api/board/${board.id}`,
        method: "delete",
      })
      .then(() => {
        fetchData();
        clearNewBoard();
        setCurrentBoard(undefined);
        toast.success("delete success");
      })
      .catch((err) => alert(err));
  }

  function handleSubmit(board: Board | undefined) {
    if (modal.button == "Create") {
      axios
        .request({
          url: "/api/board",
          method: "post",
          data: newBoard,
        })
        .then(() => {
          fetchData();
          clearNewBoard();
          toast.success("create success");
        })
        .catch((err) => alert(err));
    } else if (board) {
      axios
        .request({
          url: `/api/board/${board.id}`,
          method: "put",
          data: newBoard,
        })
        .then(async () => {
          await fetchData();
          const updated = await axios.get<Board>(`/api/board/${board.id}`);
          setCurrentBoard(updated.data);
          clearNewBoard();
          toast.success("update success");
        })
        .catch((err) => alert(err));
    } else {
      alert("something went worng.");
    }
  }

  function handleLogout() {
    axios
      .request({
        url: "/api/auth/logout",
        method: "post",
      })
      .then(() => {
        toast.success("logout success");
        navigate("/");
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.message || "Something went wrong";
          alert(msg);
        }
      });
  }

  return (
    <div>
      <div className="flex flex-row h-screen bg-gray-50 ">
        <div className="fixed top-0 left-0 h-full w-1/5 bg-gray-700 flex flex-col z-10">
          <h1 className="mx-2 my-3 p-3 subheading text-gray-200 text-left border-b border-gray-500">
            My Board
          </h1>
          {boards.map((board) => (
            <div key={board.id} className="relative">
              <button
                onClick={() => setCurrentBoard(board)}
                data-cy={`board-${board.id}`}
                className={`w-full text-left px-10 py-2 text-gray-200 ${
                  currentBoard?.id === board.id
                    ? "bg-gray-600"
                    : "hover:bg-gray-600 cursor-pointer"
                }`}
              >
                {board.name}
              </button>

              {currentBoard?.id === board.id && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex space-x-2">
                  <button
                    className="cursor-pointer"
                    onClick={() => updateBoard(currentBoard)}
                    data-cy="edit-button"
                  >
                    <img src="/edit.svg" alt="edit" className="w-5 h-5" />
                  </button>
                  <button
                    className="cursor-pointer"
                    onClick={() => {
                      deleteBoard(currentBoard);
                    }}
                    data-cy="delete-button"
                  >
                    <img src="/bin.svg" alt="delete" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            className="w-full text-gray-200 text-left px-8 py-2 hover:bg-gray-500 cursor-pointer"
            onClick={() =>
              setModal({
                title: "Create new board",
                button: "Create",
                show: true,
              })
            }
            data-cy="create-board-button"
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
        {modal.show && (
          <div className="fixed inset-0 bg-black/25 flex justify-center items-center z-50">
            <div className="bg-gray-200 rounded-lg p-6 w-96">
              <h2 className="text-lg text-gray-800 font-bold mb-4">
                {modal.title}
              </h2>
              <input
                type="text"
                name="name"
                placeholder="Name"
                data-cy="input-board-name"
                value={newBoard.name}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                data-cy="input-board-description"
                value={newBoard.description}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => clearNewBoard()}
                  className="px-4 py-2 gray-button"
                >
                  cancel
                </button>
                <button
                  onClick={() => {
                    handleSubmit(currentBoard);
                    setModal((prev) => ({
                      ...prev,
                      show: false,
                    }));
                  }}
                  className="px-4 py-2 yellow-button"
                  data-cy="submit-board-button"
                >
                  {modal.button}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="ml-[20%] flex-1">
          {/* <main>{JSON.stringify(currentBoard)}</main> */}
          {currentBoard && (
            <div className="flex flex-col h-full">
              <div className="w-full bg-gray-100 px-6 py-4 border-b border-gray-300 shadow-sm">
                <h1
                  className="text-xl font-semibold text-gray-800"
                  data-cy="board-name"
                >
                  {currentBoard.name}
                </h1>
                {currentBoard.description && (
                  <p
                    className="text-sm text-gray-600 mt-1"
                    data-cy="board-description"
                  >
                    {currentBoard.description}
                  </p>
                )}
              </div>

              <ListComponent board={currentBoard} />
            </div>
          )}
          {!currentBoard && (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center content">Create or select board.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoList;

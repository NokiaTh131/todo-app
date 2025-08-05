import axios from "axios";
import type { Board, List } from "../types";
import { useEffect, useState, type FC } from "react";
import CardComponent from "./CardComponent";
import { toast } from "sonner";

interface Props {
  board: Board;
  isPending: Boolean;
  startTransition: React.TransitionStartFunction;
}

const ListComponent: FC<Props> = ({
  board,
  isPending,
  startTransition,
}: Props) => {
  const [lists, setLists] = useState<List[]>([]);
  const [editingListId, setEditingListId] = useState<string>("");
  const [editName, setEditName] = useState<string>("");

  async function fetchData() {
    startTransition(async () => {
      const res = await axios.get<List[]>(`api/lists/board/${board.id}`);
      setLists(res.data);
    });
  }

  useEffect(() => {
    fetchData();
  }, [board.id]);

  function creatList() {
    startTransition(async () => {
      axios
        .request({
          url: `/api/lists/board/${board.id}`,
          method: "post",
          data: {
            name: "New board",
          },
        })
        .then(() => {
          fetchData();
          toast.success("create success");
        })
        .catch((err) => alert(err));
    });
  }

  function updateList(list: List, name: string) {
    startTransition(async () => {
      axios
        .request({
          url: `/api/lists/${list.id}`,
          method: "patch",
          data: {
            name: name,
          },
        })
        .then(() => {
          fetchData();
          setEditName("");
          setEditingListId("");
          toast.success("update success");
        })
        .catch((err) => alert(err));
    });
  }

  function deleteList(list: List) {
    startTransition(async () => {
      axios
        .request({
          url: `/api/lists/${list.id}`,
          method: "delete",
        })
        .then(() => {
          fetchData();
          toast.success("delete success");
        })
        .catch((err) => alert(err));
    });
  }

  return (
    <div className={`${isPending ? "pointer-events-none" : ""}`}>
      <div className="p-4">
        <div className="flex flex-wrap gap-4 items-start">
          {lists.map((list) => (
            <div
              data-cy={`list-${list.id}`}
              key={list.id}
              className="relative bg-gray-700 shadow-md rounded-md w-64 p-4"
            >
              {editingListId === list.id ? (
                <input
                  value={editName}
                  data-cy={`input-edit-list-${list.id}`}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => updateList(list, editName)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateList(list, editName);
                    }
                  }}
                  className="w-full p-1 rounded text-sm bg-gray-200 mb-4"
                  autoFocus
                />
              ) : (
                <h2 className="subheading text-gray-200 mb-4">{list.name}</h2>
              )}

              {editingListId !== list.id ? (
                <div className="absolute top-8 right-4 -translate-y-1/2 flex space-x-2">
                  <button
                    data-cy={`edit-list-button-${list.id}`}
                    className="cursor-pointer"
                    onClick={() => {
                      setEditName(list.name); // เตรียมชื่อเดิมมาใส่ input
                      setEditingListId(list.id); // เข้าโหมด edit ของ list นี้
                    }}
                  >
                    <img src="/edit.svg" alt="edit" className="w-5 h-5" />
                  </button>
                  <button
                    data-cy={`delete-list-button-${list.id}`}
                    className="cursor-pointer"
                    onClick={() => {
                      deleteList(list); // ลบ list
                    }}
                  >
                    <img src="/bin.svg" alt="delete" className="w-5 h-5" />
                  </button>
                </div>
              ) : null}

              {/* TODO: Render cards */}
              <CardComponent
                list={list}
                allLists={lists}
                onCardUpdated={fetchData}
                isPending={isPending}
                startTransition={startTransition}
              />
            </div>
          ))}

          <button
            onClick={creatList}
            className="yellow-button"
            data-cy="add-list-button"
          >
            + Add another list
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListComponent;

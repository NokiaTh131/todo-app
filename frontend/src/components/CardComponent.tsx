import axios from "axios";
import { toast } from "sonner";
import type { List, Card } from "../types";
import { useEffect, useState, type FC } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface Props {
  list: List;
  allLists: List[];
  onCardUpdated: () => void;
}

const CardComponent: FC<Props> = (prop) => {
  const list = prop.list;
  const allLists = prop.allLists;
  const onCardUpdated = prop.onCardUpdated;

  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card>();

  async function fetchData() {
    const res = await axios.get<Card[]>(`api/cards/list/${list.id}`);
    setCards(res.data);
  }

  useEffect(() => {
    fetchData();
  }, [list]);

  function createCard() {
    axios
      .request({
        url: `/api/cards/list/${list.id}`,
        method: "post",
        data: {
          title: "New card",
        },
      })
      .then(() => {
        fetchData();
        toast.success("create success");
      })
      .catch((err) => alert(err));
  }

  function updateCard() {
    axios
      .request({
        url: `/api/cards/${currentCard?.id}`,
        method: "patch",
        data: {
          title: currentCard?.title,
          description: currentCard?.description,
          due_date: currentCard?.due_date,
        },
      })
      .then(() => {
        fetchData();
        toast.success("Update success");
      })
      .catch((err) => alert(err));

    axios
      .request({
        url: `/api/cards/${currentCard?.id}/move`,
        method: "put",
        data: {
          newListId: currentCard?.list_id,
        },
      })
      .then(() => {
        fetchData();
        onCardUpdated();
      })
      .catch((err) => alert(err));
  }

  function deleteCard() {
    axios
      .request({
        url: `/api/cards/${currentCard?.id}`,
        method: "delete",
      })
      .then(() => {
        fetchData();
        setCurrentCard(undefined);
        toast.success("delete success");
      })
      .catch((err) => alert(err));
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCurrentCard((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : prev
    );
  };

  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <button
          key={card.id}
          className="relative w-full bg-gray-600 text-left card-button"
          onClick={() => setCurrentCard(card)}
        >
          {card.title}
          {card.due_date && (
            <div className="absolute top-4 right-2 -translate-y-1/2  px-2 py-1 rounded">
              {dayjs(card.due_date).isBefore(dayjs())
                ? "Overdue"
                : dayjs(card.due_date).fromNow(true) + " left"}
            </div>
          )}
        </button>
      ))}
      <button
        className="w-full border-2 border-dashed text-center card-button"
        onClick={() => createCard()}
      >
        + Add new card
      </button>
      {currentCard && (
        <div className="fixed inset-0 bg-black/25 flex justify-center items-center z-50">
          <div className="relative bg-gray-200 rounded-lg p-6 w-1/2">
            <div className="absolute top-4 right-4 -translate-y-1/2 flex space-x-2">
              <button
                className="cursor-pointer subheading text-gray-400"
                onClick={() => setCurrentCard(undefined)}
              >
                x
              </button>
            </div>
            <div className="flex flex-row items-baseline">
              <input
                type="text"
                name="title"
                className="subheading text-gray-800 resize-none"
                style={{ width: `${(currentCard.title?.length || 1) + 1}ch` }}
                value={currentCard.title}
                onChange={handleChange}
              />
              <p className="mx-2 content">in list {list.name}</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full p-2 border text-gray-700 border-gray-300 rounded resize-none"
                name="description"
                rows={3}
                value={currentCard.description ?? ""}
                onChange={handleChange}
              />
              <div className="flex flex-row">
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    className="p-2 border text-gray-700 border-gray-300 rounded"
                    value={currentCard.due_date?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="mt-4 ml-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    List
                  </label>

                  <select
                    value={currentCard.list_id}
                    onChange={(e) =>
                      setCurrentCard((prev) =>
                        prev ? { ...prev, list_id: e.target.value } : prev
                      )
                    }
                    className="p-2 border border-gray-300 rounded w-full bg-gray-200 text-gray-800"
                  >
                    {allLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className=" absolute bottom-1 right-4 -translate-y-1/2 flex space-x-2">
              <button
                className="red-button"
                onClick={() => {
                  deleteCard();
                }}
              >
                Deleted
              </button>
              <button
                className="yellow-button"
                onClick={() => {
                  updateCard();
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComponent;

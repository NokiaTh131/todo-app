import axios from "axios";
import { toast } from "sonner";
import type { List, Card } from "../types";
import { useEffect, useMemo, useState, type FC } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface Props {
  list: List;
  allLists: List[];
  onCardUpdated: () => void;
  isPending: Boolean;
  startTransition: React.TransitionStartFunction;
}

const CardComponent: FC<Props> = (prop) => {
  const list = prop.list;
  const allLists = prop.allLists;
  const onCardUpdated = prop.onCardUpdated;
  const isPending = prop.isPending;
  const startTransition = prop.startTransition;

  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card>();
  const [originalListId, setOriginalListId] = useState<string>();

  async function fetchData() {
    startTransition(async () => {
      const res = await axios.get<Card[]>(`api/cards/list/${list.id}`);
      setCards(res.data);
    });
  }

  useEffect(() => {
    fetchData();
  }, [list]);

  function createCard() {
    startTransition(async () => {
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
    });
  }

  function updateCard() {
    startTransition(async () => {
      const listChanged = originalListId !== currentCard?.list_id;
      const requestData: any = {
        title: currentCard?.title,
        description: currentCard?.description,
        list_id: currentCard?.list_id,
        due_date: currentCard?.due_date,
        cover_color: currentCard?.cover_color,
      };

      if (!listChanged) {
        requestData.position = currentCard?.position;
      }

      axios
        .request({
          url: `/api/cards/${currentCard?.id}`,
          method: "patch",
          data: requestData,
        })
        .then(() => {
          fetchData();
          onCardUpdated();
          toast.success("Update success");
        })
        .catch((err) => alert(err));
    });
  }

  function deleteCard() {
    startTransition(async () => {
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
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCurrentCard((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : prev
    );
  };

  const maxPosition = useMemo(() =>
    Math.max(...allLists.map(l => Number(l.position) || 0)),
    [allLists]
  );

  const isLastList = useMemo(() =>
    Number(list.position) === maxPosition,
    [list.position, maxPosition]
  );
  const getDueDateDisplay = (dueDate: string) => {
    if (isLastList) return "";
    return dayjs(dueDate).isBefore(dayjs())
      ? "Overdue"
      : `${dayjs(dueDate).fromNow(true)} left`;
  };

  function getContrastTextColor(hexColor: string): '#000000' | '#ffffff' {
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return '#ffffff';
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  return (
    <div className={`${isPending ? "pointer-events-none" : ""}`}>
      <div className="space-y-2">
        {cards.map((card) => (
          <button
            data-cy={`card-button-${card.id}`}
            key={card.id}
            className="relative w-full text-left card-button"
            style={{ color: getContrastTextColor(card.cover_color), backgroundColor: card.cover_color }}
            onClick={() => {
              setCurrentCard(card);
              setOriginalListId(card.list_id);
            }}
          >
            {card.title}
            {card.due_date && (
              <div className="absolute top-4 right-2 -translate-y-1/2  px-2 py-1 rounded">
                {getDueDateDisplay(card.due_date)}
              </div>
            )}
          </button>
        ))}
        <button
          data-cy={`new-card-button-${list.id}`}
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
                  data-cy="close-button"
                  className="cursor-pointer subheading text-gray-400"
                  onClick={() => setCurrentCard(undefined)}
                >
                  x
                </button>
              </div>
              <div className="flex flex-row items-baseline">
                <input
                  data-cy="new-card-title"
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
                  data-cy="new-card-description"
                  className="w-full p-2 border text-gray-700 border-gray-300 rounded resize-none"
                  name="description"
                  rows={3}
                  value={currentCard.description ?? ""}
                  onChange={handleChange}
                />
                <div className="flex flex-row">
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Color
                    </label>
                    <input
                      type="color"
                      name="cover_color"
                      className="p-1 h-10 w-16 border border-gray-300 rounded cursor-pointer"
                      value={currentCard.cover_color || "#ffffff"}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mt-4 ml-5">
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
                      data-cy="new-list-button"
                      value={currentCard.list_id}
                      onChange={(e) =>
                        setCurrentCard((prev) =>
                          prev ? { ...prev, list_id: e.target.value } : prev
                        )
                      }
                      className="p-2 border border-gray-300 rounded w-full bg-gray-200 text-gray-800"
                    >
                      {allLists.map((l) => (
                        <option
                          key={l.id}
                          value={l.id}
                          data-cy={`new-list-${l.id}`}
                        >
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className=" absolute bottom-1 right-4 -translate-y-1/2 flex space-x-2">
                <button
                  data-cy="deleted-button"
                  className="red-button"
                  onClick={() => {
                    deleteCard();
                  }}
                >
                  Deleted
                </button>
                <button
                  data-cy="update-button"
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
    </div>
  );
};

export default CardComponent;

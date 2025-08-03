import axios from "axios";
import type { Board, List } from "../types";
import { useEffect, useState, type FC } from "react";

interface Props {
  board: Board;
}

const ListComponent: FC<Props> = (board) => {
  const [lists, setList] = useState<List[]>([]);

  async function fetchData() {
    const res = await axios.get<List[]>(`api/lists/board/${board.board.id}`);
    setList(res.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <main>{JSON.stringify(board.board)}</main>
      <main>{JSON.stringify(lists)}</main>
    </>
  );
};

export default ListComponent;

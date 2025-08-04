function CardComponent() {
  return (
    <div className="space-y-2">
      {["card 1", "card 2"].map((cardTitle, index) => (
        <div key={index} className="bg-gray-100 p-2 rounded shadow text-sm">
          {cardTitle}
        </div>
      ))}
    </div>
  );
}

export default CardComponent;

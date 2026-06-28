import "./RoomsSection.css";

import RoomCard from "./RoomCard/RoomCard";

function RoomsSection({
  rooms,
  loading,
  hasQuery,
  onRoomClick,
  showAll,
  onToggleViewAll,
}) {

  // Salas que serão exibidas
  const visibleRooms = showAll
    ? rooms
    : rooms.slice(0, 5);

  // Estado de carregamento
  if (loading) {
    return (
      <section className="rooms-section">
        <div className="rooms-section-header">
          <h2>Salas em Alta</h2>
        </div>

        <div className="rooms-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="room-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  // Sem resultados
  if (hasQuery && rooms.length === 0) {
    return (
      <section className="rooms-section">
        <div className="rooms-section-header">
          <h2>Resultados da busca</h2>
        </div>

        <div className="rooms-empty">
          <span className="rooms-empty-icon">🔍</span>
          <p>Nenhuma sala encontrada</p>
          <span>Tente outro termo de busca</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rooms-section">

      <div className="rooms-section-header">

        <h2>
          {hasQuery ? "Resultados da busca" : "Salas em Alta"}
        </h2>

        {!hasQuery && rooms.length > 5 && (
          <button
            className="view-all"
            onClick={onToggleViewAll}
          >
            {showAll ? "Mostrar menos" : "Ver todas"}
          </button>
        )}

      </div>

      <div className="rooms-list">

        {visibleRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={onRoomClick}
          />
        ))}

      </div>

    </section>
  );
}

export default RoomsSection;
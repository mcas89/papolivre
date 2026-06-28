import "./OnlineUsers.css";

import { useChat } from "../../../context/ChatContext";

function OnlineUsers({ isOpen }) {

  const { onlineUsers } = useChat();

  return (

    <aside className={`online-users ${isOpen ? "open" : "closed"}`}>

      <h4>Online</h4>

      <div className="users-list">

        {onlineUsers.map((user) => (

          <div key={user.id} className="user">

            <div className="avatar-wrapper">

              {(() => {
                const avatar = user.avatar || `https://i.pravatar.cc/150?u=${user.id}`;
                const isEmoji = avatar && !avatar.startsWith("http") && !avatar.startsWith("data:") && !avatar.startsWith("/");
                return isEmoji ? (
                  <div className="emoji-avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}}>{avatar}</div>
                ) : (
                  <img src={avatar} alt={user.name} />
                );
              })()}

              <span className={`status ${user.status || 'online'}`} />

            </div>

            <span className="name">
              {user.name}
            </span>

          </div>

        ))}

      </div>

    </aside>

  );

}

export default OnlineUsers;
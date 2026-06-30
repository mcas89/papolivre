import "./OnlineUsers.css";

import { useChat } from "../../../context/ChatContext";
import UserAvatar from "../../ui/UserAvatar/UserAvatar";

function OnlineUsers({ isOpen }) {

  const { onlineUsers } = useChat();

  return (

    <aside className={`online-users ${isOpen ? "open" : "closed"}`}>

      <h4>Online</h4>

      <div className="users-list">

        {onlineUsers.map((user) => (

          <div key={user.id} className="user">

            <div className="avatar-wrapper">

              <UserAvatar avatarData={user.avatar} fallbackUid={user.id} size={40} className="online-user-avatar" />

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
const staff = require("./staff");

class WebSocketService {
  static instance = null;

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  constructor() {
    this.socketRef = null;
  }

  connect(company, branch) {
    const path = `ws://127.0.0.1:8000/ws/chat/${company}${branch}/`;
    this.socketRef = new WebSocket(path);
    this.socketRef.onopen = () => {
      console.log("socket opened");
    };

    this.socketRef.onmessage = e => {
      //handle in coming message
      this.socketNewMessage(e.data);
    };

    this.socketRef.onerror = e => {
      console.log(e.message);
    };

    this.socketRef.onclose = () => {
      console.log("socket closed");
      this.connect();
    };
  }

  socketNewMessage(data) {
    //message received
    const { message } = JSON.parse(data);
    switch (message.section.toUpperCase()) {
      case "STAFF_UPDATE":
        socketUpdateUser(message);
        break;

      default:
        break;
    }

    // console.log(parseData);
  }

  newMessage(message) {
    this.sendMessage({
      from: message.from,
      message: message.content
    });
  }

  sendMessage(data) {
    try {
      this.socketRef.send(
        JSON.stringify({
          message: data
        })
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  state() {
    return this.socketRef.readyState;
  }

  waitForSocketConnection(callback) {
    const socket = this.socketRef;
    const recursion = this.waitForSocketConnection;
    setTimeout(() => {
      if (socket.readyState === 1) {
        console.log("connection is secure");
        if (callback != null) {
          callback();
        }

        return;
      } else {
        console.log("waiting for connection...");
        recursion(callback);
      }
    }, 1);
  }
}

const WebSocketInstance = WebSocketService.getInstance();

module.exports = WebSocketInstance;

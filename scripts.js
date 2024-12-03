// 匯入 Firebase 函數
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, update, onValue, get ,push,remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
// 初始化 Firebase
const firebaseConfig = {
    apiKey: "AIzaSyALQrpW-uaTNxm6UhyUNz2K-tnHFXL8n4w",
    authDomain: "project-190028409776314173.firebaseapp.com",
    projectId: "project-190028409776314173",
    databaseURL:"https://project-190028409776314173-default-rtdb.firebaseio.com/",
    storageBucket: "project-190028409776314173.firebasestorage.app",
    messagingSenderId: "634247389259",
    appId: "1:634247389259:web:b7a1f6b2fae1ef4618adce",
    measurementId: "G-4FL0989277"
  };
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// 存到 Cookie 的方法
function saveToCookie(data) {
    // 清除所有 Cookie
    document.cookie.split(";").forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
    const { displayName, email, photoURL, lastLoginTime, uid } = data;

    // 將資料存為 JSON 字符串
    const userData = JSON.stringify({ displayName, email, photoURL, lastLoginTime, uid });

    // 設置 Cookie (有效期 7 天)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `userData=${encodeURIComponent(userData)}; expires=${expires.toUTCString()}; path=/`;

    console.log("Data saved to cookie:", userData);
}
// 從 Cookie 顯示資料的方法
function getFromCookie() {
    // 解析 Cookie 字符串
    const cookies = document.cookie.split("; ");
    const userCookie = cookies.find(cookie => cookie.startsWith("userData="));

    if (!userCookie) {
        console.log("No user data found in cookie.");
        return null;
    }

    // 解碼並解析 JSON
    const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    console.log("Data retrieved from cookie:", userData);
    return userData;
}


(async () => {
    const userData = getFromCookie();
    if (userData) {
      document.getElementById("user-name").textContent = userData.displayName;
      const lastLoginTimeUTC = userData.lastLoginTime;
      const lastLoginDate = new Date(lastLoginTimeUTC);
      const localLastLoginTime = lastLoginDate.toLocaleString();
      document.getElementById("last-login").textContent = localLastLoginTime;
      document.getElementById("user-photo").setAttribute("src", userData.photoURL);
      document.getElementById("user-email").textContent = userData.email;
    }
  })();


  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      alert("已登出！");
      window.location.href = "index.html"; // 返回登入頁面
    });
  } else {
    console.warn("登出按鈕不存在，此頁面無需登出功能");
  }
  
  // 顯示使用者資料的 Modal
  const showUserInfoButton = document.getElementById("show-user-info"); 
  if (showUserInfoButton) {
    showUserInfoButton.addEventListener("click", () => {
      const userData = getFromCookie();
      if (userData) {
        document.getElementById("modal-user-name").innerText = userData.displayName;
        document.getElementById("modal-user-email").innerText = userData.email;
        const lastLoginDate = new Date(userData.lastLoginTime);
        const localLastLoginTime = lastLoginDate.toLocaleString();
        document.getElementById("modal-last-login").innerText = localLastLoginTime;
        document.getElementById("user-info-modal").style.display = "block";
      }
    });
  }
  // 關閉 Modal
  document.getElementById("close-user-modal").addEventListener("click", () => {
    document.getElementById("user-info-modal").style.display = "none";
  });

// 綁定按鈕點擊事件



// 確保有登入資訊
const userData = getFromCookie();
if (!userData) {
  alert("請先登入");
  window.location.href = "index.html";  // 返回登入頁面
}

document.addEventListener("DOMContentLoaded", () => {
    // 確保頁面中有 `add-note-btn` 按鈕並綁定點擊事件
    const addNoteButton = document.getElementById("add-note-btn");
    if (addNoteButton) {
      addNoteButton.addEventListener("click", () => {
        // 顯示筆記的 Modal
        openNoteModal();
      });
    }
  
    // 綁定儲存筆記按鈕
    const saveNoteButton = document.getElementById("save-note");
    if (saveNoteButton) {
      saveNoteButton.addEventListener("click", () => {
        // 確保有內容時儲存筆記
        const noteContent = document.getElementById("note-content").value.trim();
        const userData = getFromCookie();  // 從 Cookie 中獲取用戶數據
        if (noteContent && userData) {
          addNote(userData.uid, noteContent);  // 新增筆記
          document.getElementById("note-content").value = "";  // 清空筆記內容
          closeModal();  // 關閉 Modal
        } else {
          alert("請輸入筆記內容！");
        }
      });
    }
  
    // 綁定關閉筆記 Modal 按鈕
    const closeNoteModalButton = document.getElementById("close-note-modal");
    if (closeNoteModalButton) {
      closeNoteModalButton.addEventListener("click", closeModal);
    }
  
    // 綁定筆記新增表單提交事件
    const noteForm = document.getElementById("note-form");
    if (noteForm) {
      noteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const noteContent = document.getElementById("note-content").value.trim();
        if (noteContent) {
          const userData = getFromCookie();
          if (userData) {
            addNote(userData.uid, noteContent); // 新增筆記
            document.getElementById("note-content").value = ""; // 清空輸入框
            closeModal(); // 關閉 Modal
          } else {
            alert("請先登入！");
          }
        } else {
          alert("請輸入筆記內容！");
        }
      });
    }
  
    // 若頁面中存在筆記列表，則載入筆記
    const userData = getFromCookie();
    if (userData) {
      fetchNotes(userData.uid); // 根據用戶 ID 載入筆記
    }
  });
  
  // 取得筆記列表
  function fetchNotes(uid) {
    const notesRef = ref(database, `users/${uid}/notes`);
    onValue(notesRef, (snapshot) => {
      const notesList = document.getElementById("notes-list");
      notesList.innerHTML = ""; // 清空當前筆記列表
  
      if (snapshot.exists()) {
        const notes = snapshot.val();
        Object.keys(notes).forEach((noteId) => {
          const note = notes[noteId];
          const noteElement = createNoteElement(uid, noteId, note.content);
          notesList.appendChild(noteElement);
        });
      } else {
        notesList.innerHTML = '<p class="text-gray-300">尚未新增任何筆記</p>';
      }
    });
  }
  
  // 創建筆記列表項目元素
  function createNoteElement(uid, noteId, content) {
    const li = document.createElement("li");
    li.classList.add("bg-white", "bg-opacity-10", "rounded-lg", "p-4", "flex", "justify-between", "items-center", "text-white");
  
    const noteContent = document.createElement("div");
    noteContent.textContent = content;
    noteContent.classList.add("flex-grow", "mr-4", "break-words");
  
    const actionDiv = document.createElement("div");
    actionDiv.classList.add("flex", "space-x-2");
  
    const editButton = document.createElement("button");
    editButton.innerHTML = '編輯';
    editButton.classList.add("bg-yellow-500", "text-white", "px-3", "py-1", "rounded", "hover:bg-yellow-600");
    editButton.addEventListener("click", () => editNote(uid, noteId, content));
  
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '刪除';
    deleteButton.classList.add("bg-red-500", "text-white", "px-3", "py-1", "rounded", "hover:bg-red-600");
    deleteButton.addEventListener("click", () => deleteNote(uid, noteId));
  
    actionDiv.appendChild(editButton);
    actionDiv.appendChild(deleteButton);
  
    li.appendChild(noteContent);
    li.appendChild(actionDiv);
  
    return li;
  }
  
  
  // 編輯筆記
  function editNote(uid, noteId, currentContent) {
    const newContent = prompt("編輯筆記內容：", currentContent);
    if (newContent && newContent.trim() !== '') {
      const noteRef = ref(database, `users/${uid}/notes/${noteId}`);
      update(noteRef, { content: newContent });
      showNotification("筆記編輯成功！", "success");
    }
  }
  
  // 刪除筆記
  function deleteNote(uid, noteId) {
    if (confirm("確定要刪除此筆記嗎？")) {
      const noteRef = ref(database, `users/${uid}/notes/${noteId}`);
      remove(noteRef)  // 刪除指定筆記
        .then(() => {
          showNotification("筆記刪除成功！", "success");
        })
        .catch((error) => {
          console.error("刪除筆記失敗:", error);
          showNotification("筆記刪除失敗", "error");
        });
    }
  }
  
// 打開筆記 Modal
function openNoteModal() {
    document.getElementById("note-modal").style.display = "block";
  }
  
  // 關閉筆記 Modal
  function closeModal() {
    document.getElementById("note-modal").style.display = "none";
    document.getElementById("note-content").value = ""; // 清空內容
  }
  
  // 新增筆記到 Firebase
  function addNote(uid, content) {
    const notesRef = ref(database, `users/${uid}/notes`);
    const newNoteRef = push(notesRef);
    set(newNoteRef, { content });
    showNotification("筆記新增成功！", "success");
  }
  
  // 顯示通知
  function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
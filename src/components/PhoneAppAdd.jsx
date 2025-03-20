import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/PhoneAppAdd.css";

function PhoneAppAdd() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState(null); // 사진 상태 추가
  const [photoPreview, setPhotoPreview] = useState(null); // ✅ 사진 미리보기용 상태
  const navigate = useNavigate();

  const apiUrl = `http://${import.meta.env.VITE_API_HOST}/api/phoneApp`; // 서버 URL
  const uploadUrl = `http://${
    import.meta.env.VITE_API_HOST
  }/api/shoplist/photo/upload`; // 사진 업로드 API

  // 서버에서 연락처 목록을 받아오는 함수
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("연락처를 받아오지 못했습니다.");
        }
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("ERROR", error);
      }
    };

    fetchContacts();
  }, []);

  // 사진 파일 선택 핸들러
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file)); // ✅ 선택한 이미지 미리보기 표시

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userinfoId", 1);

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        // credentials: "include",
      });

      if (!response.ok) throw new Error("사진 업로드 실패");

      const contentType = response.headers.get("content-type");

      // const uploadData = await response.json();
      if (contentType && contentType.includes("application/json")) {
        const uploadData = await response.json();
        setPhoto(uploadData.filename);
      } else {
        const textData = await response.text();
        console.log("서버 응답:", textData);

        alert("서버 응답 형식이 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("사진 업로드 무슨 오류일까요:", error);
      alert("사진 업로드에 실패했습니다.");
      setPhotoPreview(null); // 업로드 실패 시 미리보기 삭제
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사 (간단한 예시)
    if (!name || !phoneNumber) {
      alert("이름과 전화번호는 필수 입력 사항입니다.");
      return;
    }

    // ID 계산 (기존 연락처 목록에서 가장 큰 ID에 1을 더한 값)
    const newId =
      contacts.length > 0
        ? Math.max(...contacts.map((contact) => contact.id)) + 1
        : 1;

    const newContact = {
      id: newId,
      name,
      phone_number: phoneNumber,
      email,
      nickname,
      memo,
      photoUrl: photo, // 업로드된 사진 URL 추가
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) {
        throw new Error("연락처를 추가하는 데 실패했습니다.");
      }
      const data = await response.json(); // 데이터 받기

      // 응답 데이터가 없으면 추가 처리하지 않음
      if (!data.id) {
        throw new Error("추가된 연락처를 찾을 수 없습니다.");
      }

      // 연락처 추가 후, 새로 추가된 연락처의 상세 페이지로 이동
      navigate(`/contact/${data.id}`);
    } catch (error) {
      console.error("Error", error);
    }
  };

  const handleInput = (e) => {
    const textarea = e.target;
    // 텍스트가 변경될 때마다 높이를 재조정
    textarea.style.height = "auto"; // 먼저 높이를 auto로 리셋
    textarea.style.height = `${textarea.scrollHeight}px`; // 내용에 맞게 높이 설정
    setMemo(e.target.value); // memo 상태 업데이트
  };

  return (
    <div className="Add_add-contact">
      {/* 돌아가기 버튼 */}
      <button onClick={() => navigate("/")} className="Add_back-button">
        🡸
      </button>
      <h1>연락처 추가</h1>
      <form className="Add_form" onSubmit={handleSubmit}>
        <div className="Add_form-detail">
          <label htmlFor="name">이름:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="Add_form-detail">
          <label htmlFor="phone_number">전화번호:</label>
          <input
            type="text"
            id="phone_number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div className="Add_form-detail">
          <label htmlFor="email">이메일:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="Add_form-detail">
          <label htmlFor="nickname">닉네임:</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="Add_form-detail">
          <label htmlFor="memo">메모:</label>
          <textarea id="memo" value={memo} onChange={handleInput} />
        </div>
        {/* ✅ 프로필 사진 업로드 미리보기 */}
        <div className="Add_form-detail">
          <label>프로필 사진:</label>
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="미리보기"
              className="profile-preview"
            />
          ) : (
            <p>사진 없음</p>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* <div className="Add_form-detail">
          <label htmlFor="photo">사진 업로드:</label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div> */}

        <button className="Add_submit-button" type="submit">
          저장
        </button>
      </form>
    </div>
  );
}

export default PhoneAppAdd;

import React, { useRef, useState } from "react";
import Image from "next/image";
export default function ImageUpload({
  setImgUrl,
  height,
  width,
  aspectRatio,
  existedImg,
  setImgUpdated,
  margin,
  padding,
}) {
  const imageInput = useRef(null);
  const [base64img, setBase64img] = useState("");
  const handleChange = (e) => {
    const img = e.target.files[0];
    const type = e.target.files[0].type;
    if (
      type === "image/jpg" ||
      type === "image/png" ||
      type === "image/jpeg" ||
      type === "image/jfif"
    ) {
      setImgUrl((prevState) => ({ ...prevState, imgUrl: img, edited: true }));
      var reader = new FileReader();
      reader.onloadend = function () {
        setBase64img(reader.result);
      };
      reader.readAsDataURL(img);
      setImgUpdated && setImgUpdated(true);
    }
  };
  return (
    <>
      <input
        name="imgUrl"
        onChange={handleChange}
        type="file"
        ref={imageInput}
        className="d-none"
        accept="image/png, .jpeg, .jpg, .jfif"
      />
      <div
        onClick={() => {
          imageInput.current?.click();
        }}
        className={`c-pointer imgUploadBox flex justify-center align-center`}
        style={{
          height: height ? height : "auto",
          width: width && width,
          aspectRatio: aspectRatio,
          margin: margin,
          padding: padding,
          border: (existedImg || base64img) && "none",
        }}
      >
        {existedImg && base64img === "" ? (
          <Image src={`${process.env.server}/${existedImg}`} layout="fill" />
        ) : base64img ? (
          <Image src={base64img} layout="fill" />
        ) : (
          "Choose image"
        )}
      </div>
    </>
  );
}

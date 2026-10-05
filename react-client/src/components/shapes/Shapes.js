import React, { useEffect, useState } from "react";
import { FaShapes } from "react-icons/fa";
import { colorDetails } from "../../Data/ColorData";
import { colorSignList } from "../../Data/ColorData";

export default function Shapes() {
  const [color, setColor] = useState("");

  const handleChange = (e) => {
    setColor(e.target.value);
  };

  // useEffect(() => {
  //   setColor("gray");
  // }, []);

  return (
    <>
      <div className="container mt-5">
        <div className="row">
          <FaShapes size={300} color={color} />
        </div>

        <div className="d-flex align-items-center justify-content-center flex-row">
          {colorDetails.map((colorD) => (
            <div class="form-check-inline mt-5" key={colorD.id}>
              <input
                class="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                onChange={handleChange}
                value={colorD.color}
              />
              <label class="form-check-label" for="inlineRadio1">
                {colorD.color}
              </label>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          View {color} Sign Language
        </button>
        </div>

        <div
          class="modal fade"
          id="exampleModal"
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">
                  {color} Sign Language
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                {colorSignList.map((colorS) => (
                  <p key={colorS.id}>
                    {color === colorS.color ? 
                    <img src={colorS.sign} alt="sign" />
                    : null}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

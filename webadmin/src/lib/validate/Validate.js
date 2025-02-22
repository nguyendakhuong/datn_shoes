import { ERROR_CHECK_LIST_TYPE } from "./ListError";

export const Validate = (
  type = "email",
  inputValue,
  listError = {},
  price,
  priceSale,
  timeStart
) => {
  let error = null;
  const reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  const regex =
    /^(3[0-9]|4[0-5]):(0[1-9]|[1-9][0-9]|[1-4][0-9]{2}|500)(,(3[0-9]|4[0-5]):(0[1-9]|[1-9][0-9]|[1-4][0-9]{2}|500))*$/;
  const regexSize = /^\d+:\d+(,\d+:\d+)*$/;
  const today = new Date();

  for (let key in listError) {
    switch (key) {
      case "required":
        error = !inputValue ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      case "minLength":
        error =
          inputValue.length < +listError[key]
            ? ERROR_CHECK_LIST_TYPE[key] + listError[key] + " kí tự"
            : null;
        break;
      case "maxLength":
        error =
          inputValue.length > +listError[key]
            ? ERROR_CHECK_LIST_TYPE[key] + listError[key] + " kí tự"
            : null;
        break;
      case "regEmail":
        error = !reg.test(inputValue) ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      case "checkNumber":
        error = isNaN(inputValue) ? ERROR_CHECK_LIST_TYPE[key] : "";
        break;
      case "checkDate":
        error =
          new Date(inputValue) <= today ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      case "checkPrice":
        error = priceSale >= price ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      case "checkNegative":
        error = inputValue <= 0 ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      case "checkTimeEnd":
        error =
          new Date(timeStart) > new Date(inputValue)
            ? ERROR_CHECK_LIST_TYPE[key]
            : null;
        break;
      case "regexSizeAndQuantity":
        error = !regex.test(inputValue) ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      case "checkRegexSize":
        error = !regexSize.test(inputValue) ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      case "checkSize":
        const pairs = inputValue.split(",");
        const uniqueNumber1s = new Set(); // Sử dụng Set để lưu trữ các number1 duy nhất
        let isValid = true; // Giả sử các number1 đều là duy nhất ban đầu
        for (let i = 0; i < pairs.length; i++) {
          const pairComponents = pairs[i].split(":");
          const number1 = pairComponents[0];
          if (uniqueNumber1s.has(number1)) {
            // Nếu number1 đã tồn tại trong uniqueNumber1s, đánh dấu là không hợp lệ
            isValid = false;
            break;
          } else {
            uniqueNumber1s.add(number1); // Nếu không, thêm number1 vào uniqueNumber1s
          }
        }
        error = !isValid ? ERROR_CHECK_LIST_TYPE[key] : null;
        break;
      default:
    }
    if (error) {
      break;
    }
  }
  return error;
};

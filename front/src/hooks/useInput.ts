import {ChangeEvent, useCallback, useState} from "react";

const useInput = <T>(initialForm: T) => {
  const [form, setForm] = useState(initialForm);
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }, []);

  const reset = useCallback(() => {
    setForm(initialForm)
  }, [initialForm])
  return [form, onChange] as const;
}

export default useInput;
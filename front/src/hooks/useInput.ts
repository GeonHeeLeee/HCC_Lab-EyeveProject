import { ChangeEvent, useCallback, useState } from 'react';

const useInput = <T>(initialForm: T) => {
  const [form, setForm] = useState(initialForm);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm({
        ...form,
        [name]: value,
      });
    },
    [form]
  );
  console.log(form);

  const reset = useCallback(() => {
    setForm(initialForm);
  }, [initialForm]);
  return [form, onChange] as const;
};

export default useInput;

import React from "react";

import styles from "@/styles/Select.module.css";

interface Element {
  value: string;
  text: string;
}

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

type Props = RequireAtLeastOne<Props1, "value" | "multipleValue"> & Props2;

interface Props1 {
  value: string;
  multipleValue: string[];
}

interface Props2 {
  elements: Element[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  firstUnselectedElement?: Element;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
}

export const Select = ({
  elements,
  onChange,
  value,
  firstUnselectedElement,
  required,
  multiple,
  disabled,
  multipleValue,
}: Props) => {
  firstUnselectedElement && elements.unshift(firstUnselectedElement);
  return (
    <select
      className={styles.selector}
      onChange={onChange}
      value={multiple ? multipleValue : value}
      required={required}
      multiple={multiple}
      disabled={disabled}
    >
      {elements.map((l, index) => (
        <option key={index} value={l.value}>
          {l.text}
        </option>
      ))}
    </select>
  );
};

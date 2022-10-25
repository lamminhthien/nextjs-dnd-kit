import React, {ReactNode} from 'react';
interface IColumnTask {
  children: ReactNode;
}

export default function ColumnTask({children}: IColumnTask) {
  return <ul>{children}</ul>;
}

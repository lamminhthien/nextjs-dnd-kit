import React, {ReactNode} from 'react';
interface IColumnBody {
  children: ReactNode;
}

export default function ColumnBody({children}: IColumnBody) {
  return <ul>{children}</ul>;
}

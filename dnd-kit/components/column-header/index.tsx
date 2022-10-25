import React from 'react';
import {Handle, Remove} from '../Item';
interface IColumnHeader {
  title: string;
  onRemove: () => void;
  onHandle: React.HTMLAttributes<any> | undefined;
}

export default function ColumnHeader({title, onRemove, onHandle}: IColumnHeader) {
  return (
    <div className='kanban-header'>
      {title ? (
        <>
          <div className='column-title'>Column {title}</div>
          <Remove onClick={onRemove} />
          <Handle {...onHandle} />
        </>
      ) : null}
    </div>
  );
}

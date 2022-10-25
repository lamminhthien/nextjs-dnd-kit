import {UniqueIdentifier} from '@dnd-kit/core';
import type {MutableRefObject} from 'react';

type AnyData = Record<string, any>;

export type Data<T = AnyData> = T & AnyData;

export type DataRef<T = AnyData> = MutableRefObject<Data<T> | undefined>;

export type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

import type { FC } from 'react';
import { Fragment } from 'react';

import { EthereumIcon, PolygonIcon } from '@ui/NetworkIcons';
import Badge from '@ui/badge/Badge';

type NetworkBadgeProps = {
  value: number;
};

const NetworkBadge: FC<NetworkBadgeProps> = ({ value }) => {
  switch (value) {
    case 1:
      return (
        <Badge variant='blue' className='inline-flex gap-1'>
          <EthereumIcon height={12} width={12} />
          Ethereum
        </Badge>
      );
    case 5:
      return (
        <Badge variant='blue' className='inline-flex gap-1'>
          <EthereumIcon height={12} width={12} />
          Goerli
        </Badge>
      );
    case 137:
      return (
        <Badge variant='purple' className='inline-flex gap-1'>
          <PolygonIcon height={12} width={12} />
          Polygon
        </Badge>
      );
    case 80001:
      return (
        <Badge variant='purple' className='inline-flex gap-1'>
          <PolygonIcon height={12} width={12} />
          Mumbai
        </Badge>
      );
    default:
      return <Fragment />;
  }
};

export default NetworkBadge;

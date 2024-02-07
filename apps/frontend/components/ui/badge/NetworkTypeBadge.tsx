import type { FC } from 'react';
import { Fragment } from 'react';

import Badge from '@ui/badge/Badge';

type NetworkTypeBadgeProps = {
  value: number;
};
const NetworkTypeBadge: FC<NetworkTypeBadgeProps> = ({ value }) => {
  const testChainIds = [4, 5, 42, 97, 420, 80001];
  const maninetChainIds = [
    1, 10, 56, 137, 250, 1287, 43114, 43113, 8453, 42161
  ];

  if (testChainIds.includes(value))
    return <Badge variant='yellow'>Testnet</Badge>;
  if (maninetChainIds.includes(value))
    return <Badge variant='green'>Mainnet</Badge>;

  return <Fragment />;
};

export default NetworkTypeBadge;

import React from 'react';
import { HeartPickup as PickupType } from '../types';
import HeartPickup from './HeartPickup';
import ShieldPickup from './ShieldPickup';

interface PickupProps {
  pickup: PickupType;
}

const Pickup: React.FC<PickupProps> = ({ pickup }) => {
  if (pickup.type === 'heart') {
    return <HeartPickup heart={pickup} />;
  } else if (pickup.type === 'shield') {
    return <ShieldPickup shield={pickup} />;
  }
  
  return null;
};

export default Pickup;
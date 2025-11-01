interface IEvent {
  _id: string;
  eventName: string;
  eventDate: string;
  prizeType: 'INR' | 'COIN';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  categories: Array<ICategory>;
  prizePool: number;
  createdAt: string;
  updatedAt: string;
  progress: number;
}

interface ICategory {
  _id: string;
  name: string;
  color:
    | 'categoryColor1'
    | 'categoryColor2'
    | 'categoryColor3'
    | 'categoryColor4'
    | '';
  minCoins: number;
  maxCoins: number;
  prizes: Prize[];
  winners?: IWinner[];
}

interface IEventCategoryUIData {
  _id: string;
  title: string;
  color:
    | 'categoryColor1'
    | 'categoryColor2'
    | 'categoryColor3'
    | 'categoryColor4'
    | '';
  prize: number;
  rank: number;
  progress: number;
  prizeType: 'INR' | 'COIN';
}

interface IWinner {
  prize: number;
  rank: number;
  user: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    coins: number;
    profilePicture?: string;
    trend: 'up' | 'down' | 'same';
  };
}

type PrizeType = 'single' | 'range';

interface Prize {
  type: PrizeType;
  singleRank?: number;
  startRange?: number;
  endRange?: number;
  prize: string;
}

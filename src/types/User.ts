import type { Squad } from './Squad';

export interface Profile {
  user_id: number
  first_name: string
  profilepicture: string
}

export interface User extends Profile {
  email: string
  last_name: string
  user_fullname: string
  gender: string
  birthday: string
  country: string
  phonenumber: string
  clubname: string
  hand: string
  squads: Squad[]
}

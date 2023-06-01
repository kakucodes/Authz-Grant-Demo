import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import {
  AuthorizationType,
  StakeAuthorization,
} from "cosmjs-types/cosmos/staking/v1beta1/authz";
import { Coin } from "@cosmjs/stargate";

export const numOfDaysToExpiration = (numOfDays: number): Timestamp => {
  const dateNow = new Date();
  const dateIn2Years = new Date(dateNow.getTime() + numOfDays);
  const timeMS = dateIn2Years.getTime();

  return Timestamp.fromPartial({
    seconds: timeMS / 1000,
    nanos: (timeMS % 1000) * 1e6,
  });
};

export const grantGenericDelegate = ({
  granter,
  duration,
  grantee,
}: {
  granter: string;
  duration: number;
  grantee: string;
}) => {
  const msgValue: MsgGrant = {
    granter,
    grantee,
    grant: {
      authorization: {
        typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
        value: GenericAuthorization.encode(
          GenericAuthorization.fromPartial({
            msg: "/cosmos.staking.v1beta1.MsgDelegate",
          })
        ).finish(),
      },
      expiration: numOfDaysToExpiration(duration),
    },
  };

  const msg = {
    typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
    value: msgValue,
  };
  // console.log("withdraw delegationReward msg", msg);
  return msg;
};

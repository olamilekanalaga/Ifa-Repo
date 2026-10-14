export const breshnaHistorical = {
  "id": "breshna-historical-2023",
  "brand": "Breshna",
  "website": "https://breshna.io",
  "title": "Breshna — Create Your First Game",
  "topic": "Gaming",
  "type": "historical_reconstruction",
  "visibility": "demo",
  "status": "historical_unverified",
  "logo": {
    "source": "https://breshna.io",
    "localPath": null,
    "rights": "Official logo requires approved asset/permission before republishing"
  },
  "objective": "Acquire referred users who register and create at least one game.",
  "campaignModel": "fixed_per_qualified_referral",
  "events": [
    {
      "key": "account_registered",
      "label": "Email account registered",
      "rewardUSD": 0,
      "source": "client_backend"
    },
    {
      "key": "first_game_created",
      "label": "First game created",
      "rewardUSD": 0,
      "source": "client_backend"
    }
  ],
  "qualification": {
    "requires": [
      "account_registered",
      "first_game_created"
    ],
    "sameCustomer": true,
    "oneRewardPerCustomer": true,
    "referrerRequired": true,
    "excludeSelfReferral": true
  },
  "reward": {
    "recipient": "referrer",
    "currency": "USD",
    "amount": 1,
    "trigger": "first_game_created",
    "paymentStatus": "not_verified"
  },
  "measurement": {
    "mode": "historical_reconstruction",
    "sourceOfTruth": "client_signed_events_if_available",
    "attributionWindowDays": null,
    "maxPayoutUSD": null
  },
  "evidence": [
    {
      "claim": "Historical referral incentive was $1 per referred user who created a game",
      "sourceType": "operator_recollection",
      "verification": "unverified"
    },
    {
      "claim": "100,000 referred users created games across all participating creators",
      "sourceType": "operator_report",
      "verification": "unverified",
      "metricDefinition": "Referred users who created a game; aggregate across participating creators"
    },
    {
      "claim": "Breshna offers no-code video game creation",
      "sourceType": "company_website",
      "url": "https://breshna.io",
      "verification": "public_company_description"
    }
  ],
  "report": {"budgetUSD": 100000, "gameCreatingUsers": 100000, "participatingCreators": null, "source": "campaign_operator_report"},
  "metrics": {
    "verifiedReferrals": null,
    "registeredUsers": null,
    "activatedGameMakers": 100000,
    "paidRewardsUSD": null
  },
  "notes": "Historical case only. No invented creator identities, payout amounts, conversions or event logs."
};

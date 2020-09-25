### Usage:
```
$DECRYPT_PASSWORD=xxxxxx   (from secret/keybase)
$ENCRYPTED_WALLET_FILE=hypha-btc-treasury-1.json  (from keybase)
node  history.js -i -e $DECRYPT_PASSWORD $ENCRYPTED_WALLET_FILE
```

### Output:
> NOTE: unformatted query results has more info, such as transaction ID, addresses, etc.
```
* TX History:
(node:85167) Warning: Accessing non-existent property 'sign' of module exports inside circular dependency
(Use `node --trace-warnings ...` to show where the warning was created)
Importing from file:/Users/max/dev/hypha/hyphat1-pub.aes.json
Backup is encrypted
* Wallet Hypha Treasury [livenet]: 3-of-5 complete Coin:btc
* Copayers: hyphanewyork, Nikolaus Heger, Alex, Joachim Stroh, Max mobile
* Balance 0.01723414 btc (Locked: 0.00000000 btc)
	a month ago: => sent 0.09617579 btc ["Vasyl: $1,142" by Alex] (5709 confirmations)
	2 months ago: => sent 0.00693465 btc ["Stefan - $76" by Alex] (8551 confirmations)
	2 months ago: => sent 0.07706232 btc ["Piyush - $791" by Alex] (8775 confirmations)
	3 months ago: => sent 0.09179220 btc ["null" by Alex] (11804 confirmations)
	3 months ago: => sent 0.11209542 btc ["null" by Alex] (12577 confirmations)
	3 months ago: <= received 0.05000000 btc (13200 confirmations)
	3 months ago: => sent 0.43900653 btc ["Vasy: 4018 - 50 (test transaction)" by Alex] (13201 confirmations)
	3 months ago: => sent 0.00557973 btc ["Vasyl Test Transaction" by Alex] (13210 confirmations)
	3 months ago: => sent 0.54625884 btc ["hyphanewyork, red. ID 17" by hyphanewyork] (13256 confirmations)
	3 months ago: => sent 0.65548840 btc ["Alex" by Alex] (13341 confirmations)
	3 months ago: <= received 2.00000000 btc (13402 confirmations)
	3 months ago: => sent 0.00054380 btc ["Test transaction Lisa and Franz" by Alex] (13500 confirmations)
	4 months ago: => sent 0.03360349 btc ["null" by Alex] (17319 confirmations)
	4 months ago: => sent 0.08136846 btc ["Toto = 794-85=709 USD" by Alex] (19975 confirmations)
	4 months ago: => sent 0.16521355 btc ["Antonio: 1439.58 usd" by Alex] (19975 confirmations)
	4 months ago: => sent 0.00500000 btc ["toto test" by hyphanewyork] (20054 confirmations)
	4 months ago: => sent 0.79000000 btc ["null" by hyphanewyork] (20059 confirmations)
	4 months ago: => sent 0.00500000 btc ["piyush test trx" by hyphanewyork] (20061 confirmations)
	4 months ago: <= received 0.50000000 btc (20091 confirmations)
	4 months ago: <= received 0.17520000 btc (20093 confirmations)
	4 months ago: <= received 0.32000000 btc (20094 confirmations)
	4 months ago: => sent 0.00500000 btc ["null" by hyphanewyork] (20112 confirmations)
	4 months ago: => sent 0.00500000 btc ["null" by hyphanewyork] (20132 confirmations)
	4 months ago: => sent 0.00100000 btc ["null" by hyphanewyork] (20132 confirmations)
	4 months ago: <= received 0.10000000 btc (20145 confirmations)
	5 months ago: <= received 0.00224106 btc (20327 confirmations)
```
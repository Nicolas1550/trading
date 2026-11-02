-- QUANTUM V14.6: OPTIONAL catalog seed for paper-trading new assets.
-- Read-only market quotes and charts do NOT need this migration.
-- Run this on Neon AFTER backing up / choosing the correct branch. Does not delete rows.
DO $$
DECLARE item record; column_kind text;
BEGIN
 SELECT column_name INTO column_kind FROM information_schema.columns
 WHERE table_schema='public' AND table_name='assets' AND column_name IN ('asset_type','type')
 ORDER BY CASE WHEN column_name='asset_type' THEN 0 ELSE 1 END LIMIT 1;
 IF column_kind IS NULL THEN
  RAISE NOTICE 'Could not identify assets.asset_type or assets.type. No changes made.';
  RETURN;
 END IF;
 FOR item IN
 SELECT * FROM (VALUES
 ('AMD','Advanced Micro Devices','stock','NASDAQ'),('INTC','Intel Corporation','stock','NASDAQ'),('AVGO','Broadcom Inc.','stock','NASDAQ'),
 ('NFLX','Netflix Inc.','stock','NASDAQ'),('COST','Costco Wholesale','stock','NASDAQ'),('ADBE','Adobe Inc.','stock','NASDAQ'),
 ('JPM','JPMorgan Chase & Co.','stock','NYSE'),('KO','The Coca-Cola Company','stock','NYSE'),('WMT','Walmart Inc.','stock','NYSE'),
 ('DIS','The Walt Disney Company','stock','NYSE'),('V','Visa Inc.','stock','NYSE'),('MA','Mastercard Incorporated','stock','NYSE'),
 ('XOM','Exxon Mobil Corporation','stock','NYSE'),('BA','The Boeing Company','stock','NYSE'),('CAT','Caterpillar Inc.','stock','NYSE'),
 ('VOO','Vanguard S&P 500 ETF','etf','NYSE ARCA'),('IVV','iShares Core S&P 500 ETF','etf','NYSE ARCA'),
 ('DIA','SPDR Dow Jones Industrial Average ETF','etf','NYSE ARCA'),('IWM','iShares Russell 2000 ETF','etf','NYSE ARCA'),
 ('SOL/USD','Solana / US Dollar','crypto','CRYPTO'),('ADA/USD','Cardano / US Dollar','crypto','CRYPTO'),
 ('DOGE/USD','Dogecoin / US Dollar','crypto','CRYPTO'),('LTC/USD','Litecoin / US Dollar','crypto','CRYPTO')
 ) AS s(symbol,name,kind,exchange)
 LOOP
  IF NOT EXISTS (SELECT 1 FROM public.assets a WHERE a.symbol=item.symbol) THEN
   EXECUTE format('INSERT INTO public.assets(symbol,name,%I,exchange,currency) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',column_kind)
   USING item.symbol,item.name,item.kind,item.exchange,'USD';
  END IF;
 END LOOP;
END $$;
-- Verify with:
-- SELECT symbol,name,exchange FROM assets WHERE symbol IN ('AMD','JPM','VOO','SOL/USD') ORDER BY symbol;

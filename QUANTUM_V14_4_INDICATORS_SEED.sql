-- QUANTUM V14.4 / optional catalog preload.
-- The /api/layouts route also seeds selected indicators on save.
-- Run this only after the V11 Block 1 migration.
-- No DROP or ALTER statements; safe to rerun.
INSERT INTO indicator_definitions(code,name,category,description,overlay,supported)
VALUES
 ('EMA20','EMA 20','Tendencia','Media móvil exponencial de 20 períodos',true,true),
 ('EMA50','EMA 50','Tendencia','Media móvil exponencial de 50 períodos',true,true),
 ('EMA100','EMA 100','Tendencia','Media móvil exponencial de 100 períodos',true,true),
 ('EMA200','EMA 200','Tendencia','Media móvil exponencial de 200 períodos',true,true),
 ('SMA20','SMA 20','Tendencia','Media móvil simple de 20 períodos',true,true),
 ('SMA50','SMA 50','Tendencia','Media móvil simple de 50 períodos',true,true),
 ('SMA100','SMA 100','Tendencia','Media móvil simple de 100 períodos',true,true),
 ('SMA200','SMA 200','Tendencia','Media móvil simple de 200 períodos',true,true),
 ('WMA20','WMA 20','Tendencia','Media ponderada de 20 períodos',true,true),
 ('HMA20','HMA 20','Tendencia','Hull MA de 20 períodos',true,true),
 ('VWMA20','VWMA 20','Tendencia','Media ponderada por volumen',true,true),
 ('VWAP','VWAP','Volumen','VWAP acumulado en la serie visible',true,true),
 ('BOLL','Bollinger Bands','Volatilidad','Bandas de 20 períodos y 2 desviaciones',true,true),
 ('DONCHIAN20','Donchian 20','Tendencia','Canal Donchian de 20',true,true),
 ('KELTNER20','Keltner 20','Volatilidad','Canal Keltner',true,true),
 ('SUPERTREND','Supertrend','Tendencia','Supertrend aproximado',true,true),
 ('ICHIMOKU','Ichimoku Tenkan/Kijun','Tendencia','Líneas Tenkan y Kijun',true,true),
 ('PSAR','Parabolic SAR','Tendencia','Parabolic stop-and-reverse',true,true),
 ('RSI','RSI 14','Momentum','Relative Strength Index',false,true),
 ('MACD','MACD','Momentum','MACD 12/26/9',false,true),
 ('STOCH','Stochastic','Momentum','Estocástico 14',false,true),
 ('STOCHRSI','Stoch RSI','Momentum','Estocástico de RSI',false,true),
 ('CCI','CCI','Momentum','Commodity Channel Index',false,true),
 ('ROC','ROC','Momentum','Rate of Change',false,true),
 ('WILLIAMS','Williams %R','Momentum','Williams %R',false,true),
 ('ADX','ADX','Tendencia','Average Directional Index',false,true),
 ('MOM','Momentum','Momentum','Variación absoluta 12',false,true),
 ('AROON','Aroon','Tendencia','Aroon Up/Down',false,true),
 ('OBV','OBV','Volumen','On Balance Volume',false,true),
 ('CMF','CMF','Volumen','Chaikin Money Flow',false,true),
 ('MFI','MFI','Volumen','Money Flow Index',false,true),
 ('ATR','ATR','Volatilidad','Average True Range',false,true),
 ('HV20','Historical Volatility','Volatilidad','Volatilidad histórica 20',false,true),
 ('BBWIDTH','Bollinger Band Width','Volatilidad','Ancho de bandas de Bollinger',false,true)
ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,overlay=EXCLUDED.overlay,supported=EXCLUDED.supported;

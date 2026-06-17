import { useState } from 'react';
import { ArrowLeft, Save, Droplets, Wind, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store';
import type { PriceConfig, ClothingType } from '@/types';
import { CLOTHING_TYPE_NAMES, WASH_TYPE_NAMES, DEFAULT_PRICE_CONFIG } from '@/config/prices';

const clothingOptions: ClothingType[] = ['shirt', 'pants', 'coat', 'bedding'];

export default function PriceSettings() {
  const navigate = useNavigate();
  const { priceConfig, updatePriceConfig } = useOrderStore();
  const [tempConfig, setTempConfig] = useState<PriceConfig>(JSON.parse(JSON.stringify(priceConfig)));
  const [saved, setSaved] = useState(false);

  const handlePriceChange = (
    washType: 'water' | 'dry',
    clothingType: ClothingType,
    value: string
  ) => {
    const price = parseFloat(value) || 0;
    setTempConfig((prev) => ({
      ...prev,
      [washType]: {
        ...prev[washType],
        [clothingType]: Math.max(0, price),
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    updatePriceConfig(tempConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setTempConfig(JSON.parse(JSON.stringify(DEFAULT_PRICE_CONFIG)));
    setSaved(false);
  };

  const hasChanges = JSON.stringify(tempConfig) !== JSON.stringify(priceConfig);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">价格设置</h2>
            <p className="text-sm text-slate-500 mt-1">设置不同洗涤类型和衣物的单价，保存后立即生效</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            恢复默认
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all duration-200 ${
              hasChanges
                ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-sky-200 hover:-translate-y-0.5'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? '已保存 ✓' : '保存设置'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700">
            ⚠️ 价格已修改但尚未保存，新价格将在保存后对新建订单生效，不影响已有订单。
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {(['water', 'dry'] as const).map((washType) => (
          <div key={washType} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  washType === 'water' ? 'bg-sky-50' : 'bg-amber-50'
                }`}
              >
                {washType === 'water' ? (
                  <Droplets className="w-6 h-6 text-sky-500" />
                ) : (
                  <Wind className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {WASH_TYPE_NAMES[washType]}价格
                </h3>
                <p className="text-sm text-slate-500">
                  {washType === 'water' ? '日常水洗，经济实惠' : '专业干洗，高档护理'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {clothingOptions.map((clothingType) => (
                <div
                  key={clothingType}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                      {CLOTHING_TYPE_NAMES[clothingType].charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{CLOTHING_TYPE_NAMES[clothingType]}</p>
                      <p className="text-xs text-slate-500">
                        原价：¥{DEFAULT_PRICE_CONFIG[washType][clothingType]}/件
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">¥</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={tempConfig[washType][clothingType]}
                      onChange={(e) => handlePriceChange(washType, clothingType, e.target.value)}
                      className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-right font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                    <span className="text-slate-400 text-sm">/件</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">价格预览（新建订单）</h3>
        <div className="grid grid-cols-4 gap-4">
          {clothingOptions.map((clothingType) => (
            <div key={clothingType} className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-sm text-slate-500 mb-2">{CLOTHING_TYPE_NAMES[clothingType]}</p>
              <div className="flex items-center justify-center gap-3">
                <div>
                  <p className="text-xs text-sky-600">水洗</p>
                  <p className="text-lg font-bold text-sky-700">¥{tempConfig.water[clothingType]}</p>
                </div>
                <div className="text-slate-300">|</div>
                <div>
                  <p className="text-xs text-amber-600">干洗</p>
                  <p className="text-lg font-bold text-amber-700">¥{tempConfig.dry[clothingType]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

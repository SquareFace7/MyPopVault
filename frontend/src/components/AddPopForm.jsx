import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Upload, Package, DollarSign, Calendar, Hash, Image, Star, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import BouncyButton from './BouncyButton';

import { BOX_CONDITIONS } from '@/lib/conditionHelper';

const seriesOptions = ['Marvel', 'Disney', 'Star Wars', 'DC', 'Anime', 'Movies', 'TV', 'Games', 'Music', 'Sports'];
const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Grail'];
const conditionOptions = BOX_CONDITIONS;

export default function AddPopForm({ isOpen, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    series: '',
    number: '',
    purchasePrice: '',
    marketValue: '',
    image: '',
    rarity: 'Common',
    condition: 'Mint (9.5-10)',
    purchaseDate: '',
    isExclusive: false,
    notes: ''
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      number: parseInt(formData.number) || 0,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      marketValue: parseFloat(formData.marketValue) || parseFloat(formData.purchasePrice) * (1 + Math.random() * 0.5),
    });
    setFormData({
      name: '',
      series: '',
      number: '',
      purchasePrice: '',
      marketValue: '',
      image: '',
      rarity: 'Common',
      condition: 'Mint',
      purchaseDate: '',
      isExclusive: false,
      notes: ''
    });
    setStep(1);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", bounce: 0.3 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-6 relative overflow-hidden">
              {/* Animated stars */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white/50" />
                </motion.div>
              ))}

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Package className="w-7 h-7" />
                  Add New Pop!
                </h2>
                <p className="text-white/80 mt-1">Step {step} of {totalSteps}</p>
              </motion.div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ type: "spring", bounce: 0.3 }}
                />
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                        <Package className="w-4 h-4 text-pink-500" />
                        Pop Name *
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Spider-Man"
                        className="border-2 border-gray-200 rounded-xl focus:border-pink-500"
                        required
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                        <Star className="w-4 h-4 text-cyan-500" />
                        Series *
                      </Label>
                      <Select
                        value={formData.series}
                        onValueChange={(value) => handleChange('series', value)}
                      >
                        <SelectTrigger className="border-2 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Select series" />
                        </SelectTrigger>
                        <SelectContent>
                          {seriesOptions.map(series => (
                            <SelectItem key={series} value={series}>{series}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                        <Hash className="w-4 h-4 text-yellow-500" />
                        Pop Number *
                      </Label>
                      <Input
                        type="number"
                        value={formData.number}
                        onChange={(e) => handleChange('number', e.target.value)}
                        placeholder="e.g., 593"
                        className="border-2 border-gray-200 rounded-xl focus:border-pink-500"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          Purchase Price *
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.purchasePrice}
                          onChange={(e) => handleChange('purchasePrice', e.target.value)}
                          placeholder="0.00"
                          className="border-2 border-gray-200 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          Purchase Date
                        </Label>
                        <Input
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => handleChange('purchaseDate', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                          Rarity
                        </Label>
                        <Select
                          value={formData.rarity}
                          onValueChange={(value) => handleChange('rarity', value)}
                        >
                          <SelectTrigger className="border-2 border-gray-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {rarityOptions.map(rarity => (
                              <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                          Condition
                        </Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) => handleChange('condition', value)}
                        >
                          <SelectTrigger className="border-2 border-gray-200 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionOptions.map(condition => (
                              <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl border-2 border-yellow-200 dark:border-yellow-900/60">
                      <div>
                        <Label className="text-gray-700 dark:text-gray-200 font-bold">Exclusive Release?</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mark if this is a store exclusive</p>
                      </div>
                      <Switch
                        checked={formData.isExclusive}
                        onCheckedChange={(checked) => handleChange('isExclusive', checked)}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                        <Image className="w-4 h-4 text-pink-500" />
                        Image URL
                      </Label>
                      <Input
                        value={formData.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="border-2 border-gray-200 rounded-xl"
                      />
                      {formData.image && (
                        <motion.div 
                          className="mt-3 flex justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-32 h-32 object-contain rounded-xl border-2 border-gray-200"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                        <FileText className="w-4 h-4 text-cyan-500" />
                        Notes
                      </Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Any additional notes about this Pop..."
                        className="border-2 border-gray-200 rounded-xl min-h-[100px]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-4 border-t">
                {step > 1 ? (
                  <BouncyButton
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    Back
                  </BouncyButton>
                ) : (
                  <div />
                )}

                {step < totalSteps ? (
                  <BouncyButton
                    type="button"
                    variant="secondary"
                    onClick={nextStep}
                    disabled={step === 1 && (!formData.name || !formData.series || !formData.number)}
                  >
                    Next Step
                  </BouncyButton>
                ) : (
                  <BouncyButton
                    type="submit"
                    variant="primary"
                    icon={Sparkles}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add to Vault!'}
                  </BouncyButton>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
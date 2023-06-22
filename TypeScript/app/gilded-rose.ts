import { resourceUsage } from "process";

export class Item {
  name: string;
  sellIn: number;
  quality: number;

  constructor(name: string, sellIn: number, quality: number) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    for (const item of items) {
      if (item.name !== 'Sulfuras, Hand of Ragnaros') {
        if (item.quality < 0)
          throw new Error('Item quality less than 0');
        if (item.quality > 50)
          throw new Error('Item quality greater than 50');
      }

      if (item.sellIn < 0) {
        throw new Error('Item sellIn less than 0');
      }
    }

    this.items = items;
  }

  isConjured(itemName: string): boolean {
    return /^conjured/i.test(itemName);
  }

  getProcess(itemName: string) {
    const keywordProcesses: [RegExp, (item: Item) => void][] = [
      [/brie/i, this.updateBrie],
      [/backstage pass/i, this.updateBackstage],
      [/sulfuras/i, (item: Item) => { }],
    ];

    return keywordProcesses.find(([regex]) => regex.test(itemName))?.[1].bind(this)
      || this.updateDefault.bind(this);
  }

  updateQuality() {
    for (const item of this.items) {
      const process = this.getProcess(item.name);
      process(item);
      item.sellIn = Math.max(item.sellIn - 1, 0);
    }
    return this.items;
  }

  adjustQuality(init: number, delta: number): number {
    const maxQuality = 50;
    const minQuality = 0;

    let result = init + delta;
    if (result < minQuality) {
      result = minQuality;
    } else if (result > maxQuality) {
      result = maxQuality;
    }

    return result;
  }

  updateBrie(item: Item) {
    const qualityAdjustment = this.multiplyQualityAdjustment(item);
    item.quality = this.adjustQuality(item.quality, 1 * qualityAdjustment);
  }

  updateBackstage(item: Item) {
    const qualityAdjustment = this.multiplyQualityAdjustment(item);
    if (item.sellIn > 10) {
      item.quality = this.adjustQuality(item.quality, 1 * qualityAdjustment);
    }
    else if (5 < item.sellIn && item.sellIn <= 10) {
      item.quality = this.adjustQuality(item.quality, 2 * qualityAdjustment);
    }
    else if (0 < item.sellIn && item.sellIn <= 5) {

      item.quality = this.adjustQuality(item.quality, 3 * qualityAdjustment);
    } else {
      item.quality = 0;
    }
  }

  updateDefault(item: Item) {
    const qualityAdjustment = 1 * this.multiplyQualityAdjustment(item);
    item.quality = this.adjustQuality(item.quality, -1 * qualityAdjustment);
  }

  multiplyQualityAdjustment(item: Item): number {
    const outOfDate = item.sellIn === 0;
    const conjured = this.isConjured(item.name);
    return 1 * (outOfDate ? 2 : 1) * (conjured ? 2 : 1);
  }

  // updateQuality() {
  //   for (let i = 0; i < this.items.length; i++) {
  //     if (this.items[i].name != 'Aged Brie' && this.items[i].name != 'Backstage passes to a TAFKAL80ETC concert') {
  //       if (this.items[i].quality > 0) {
  //         if (this.items[i].name != 'Sulfuras, Hand of Ragnaros') {
  //           this.items[i].quality = this.items[i].quality - 1
  //         }
  //       }
  //     } else {
  //       if (this.items[i].quality < 50) {
  //         this.items[i].quality = this.items[i].quality + 1
  //         if (this.items[i].name == 'Backstage passes to a TAFKAL80ETC concert') {
  //           if (this.items[i].sellIn < 11) {
  //             if (this.items[i].quality < 50) {
  //               this.items[i].quality = this.items[i].quality + 1
  //             }
  //           }
  //           if (this.items[i].sellIn < 6) {
  //             if (this.items[i].quality < 50) {
  //               this.items[i].quality = this.items[i].quality + 1
  //             }
  //           }
  //         }
  //       }
  //     }
  //     if (this.items[i].name != 'Sulfuras, Hand of Ragnaros') {
  //       this.items[i].sellIn = this.items[i].sellIn - 1;
  //     }
  //     if (this.items[i].sellIn < 0) {
  //       if (this.items[i].name != 'Aged Brie') {
  //         if (this.items[i].name != 'Backstage passes to a TAFKAL80ETC concert') {
  //           if (this.items[i].quality > 0) {
  //             if (this.items[i].name != 'Sulfuras, Hand of Ragnaros') {
  //               this.items[i].quality = this.items[i].quality - 1
  //             }
  //           }
  //         } else {
  //           this.items[i].quality = this.items[i].quality - this.items[i].quality
  //         }
  //       } else {
  //         if (this.items[i].quality < 50) {
  //           this.items[i].quality = this.items[i].quality + 1
  //         }
  //       }
  //     }
  //   }

  //   return this.items;
  // }
}

import theoretically from 'jest-theories';

import { Item, GildedRose } from '@/gilded-rose';
import { checkServerIdentity } from 'tls';

describe('Gilded Rose', () => {
  describe('should construct if', () => {
    it(`all items (sellIn > 0 and 0 <= quality <= 50) or name contains 'selfuras'`, () => {
      const gildedRoses = [
        new GildedRose([new Item('NAME', 0, 0)]), 
        new GildedRose()
      ];
      const items = gildedRoses.updateQuality();
      expect(items[0].name).toBe('NAME');
    });
  });

  describe('construction should fail if', () => {
    const theories = [
      {sellIn: -1, quality: 0, errorMessage: 'Item sellIn less than 0'},
      {sellIn: 0, quality: -1, errorMessage: 'Item quality less than 0'},
      {sellIn: 0, quality: 51, errorMessage: 'Item quality greater than 50'},
    ];
    const theoryName = ({sellIn, quality}: {sellIn: number, quality: number}) => {
      if (sellIn < 0) {
        return `sellIn < 0`;
      } else if (quality < 0) {
        return `quality < 0`;
      } else {
        return `quality > 50 and name does not contain 'sulfuras'`;
      }
    };
    theoretically(theoryName, theories, ({sellIn, quality, errorMessage}) => {
      expect(() => new GildedRose([new Item("NAME", sellIn, quality)])).toThrowError(errorMessage)
    })
  });

  describe('Quality', () => {
    const generic_item = new GildedRose([new Item('Generic Item', 3, 0)]);

    let theories = [
      {input: generic_item, expected: 0},
    ]
    theoretically('quality should never be negative', theories, theory => {
      const output = theory.input.updateQuality();
      expect(output[0].quality).toBe(theory.expected)
    })

    const generic_item_sellIn_approaching_zero = new GildedRose([new Item('Generic Item', 1, 1)]);

    theories = [
      {input: generic_item_sellIn_approaching_zero, expected: 0},
    ]
    theoretically('quality should never be negative when sellIn approaches zero', theories, theory =>{
      let output = theory.input.updateQuality();
      expect(output[0].quality).toBe(theory.expected);
      output = theory.input.updateQuality(); // second update to check quality stay at zero
      expect(output[0].quality).toBe(theory.expected);

    })

    const aged_brie = new GildedRose([new Item('Aged Brie', 1, 50)]);
    const backstage_pass = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 1, 50)]);
    theories = [
      {input: aged_brie, expected: 50},
      {input: backstage_pass, expected: 50},
    ]
    theoretically(({input, expected}) => `quality of ${input.items[0].name} should never be above 50`, theories, theory => {
      const output = theory.input.updateQuality();
      expect(output[0].quality).toBe(theory.expected);
    })

    theoretically(({input, expected}) => `quality of ${input.items[0].name} should never be above 50 when sellIn aproaches zero`, theories, theory => {
      const output = theory.input.updateQuality();
      expect(output[0].quality).toBe(theory.expected);
    })

    const sulfuras = new GildedRose([new Item('Sulfuras, Hand of Ragnaros', 3, 5)]);

    theories = [
      {input: sulfuras, expected: 80},
    ]
    theoretically('quality of sulfuras should always be 80', theories, theory => {
      const output = theory.input.updateQuality();
      expect(output[0].quality).toBe(theory.expected);
    })
  });

  describe('Update', () => {
    const generic_item = new GildedRose([new Item('Generic Item', 3, 5)]);

    let theories = [
      {input: generic_item, expected: [2, 6]},
    ]
    theoretically('quality of generic item should increase when sellIn decreases', theories, theory => {
      const output = theory.input.updateQuality();
      expect(output[0].sellIn).toBe(theory.expected[0]);
      expect(output[0].quality).toBe(theory.expected[1]);
    })
  })

  // describe('Generic Items', () => {
  //   describe('Quality', () => {
  //     it('should degrade by 1 each update', () => {
  //       const rose = new GildedRose([new Item('Item', 5, 5)]);
  //       const items = rose.updateQuality();
  //       expect(items[0].quality).toBe(4);
  //     });

  //     it('should not go below 0', () => {
  //       const rose = new GildedRose([new Item('Item', 5, 0)]);
  //       const items = rose.updateQuality();
  //       expect(items[0].quality).toBe(0);
  //     });

  //     it('should not exist below 0', () => {
  //       const constructor = () => new GildedRose([new Item('Item', 5, -1)]);
  //       expect(constructor).toThrowError('Item quality less than 0');
  //     });

  //     it('should not exist above 50', () => {
  //       const constructor = () => new GildedRose([new Item('Item', 0, 51)]);
  //       expect(constructor).toThrowError('Item quality greater than 50');
  //     });

  //     it('should degrade at double speed after sellIn is zero', () => {
  //       const rose = new GildedRose([new Item('Item', 1, 10)]);
  //       let items = rose.updateQuality();
  //       expect(items[0].quality).toBe(9);
  //       items = rose.updateQuality();
  //       expect(items[0].quality).toBe(7);
  //     });
  //   });

  describe('`sellIn` should decrease by 1 and stop at 0', () => {
    const theories = [
      {input: 1, expected: 0},
      {input: 0, expected: 0},
    ]

    theoretically('an item with a `sellIn` of {input} should have a `sellIn` of {expected} after update', theories, ({input, expected}) => {
      const resultantSellIn = new GildedRose([new Item("NAME", input, 0)]).updateQuality()[0].sellIn;
      expect(resultantSellIn).toBe(expected);
    });
  });

  // });

  // describe('Aged Brie', () => {
  //   it('should quality + 1 as sellIn - 1', () => {
  //     const cheese = new GildedRose([new Item('Aged Brie', 5, 5)]);
  //     let updated_cheese = cheese.updateQuality();
  //     expect(updated_cheese[0].quality).toBe(6);
  //     expect(updated_cheese[0].sellIn).toBe(4);
  //   });

  //   it('should not go above 50', () => {
  //     const rose = new GildedRose([new Item('Aged Brie', 1, 50)]);
  //     let items = rose.updateQuality();
  //     expect(items[0].quality).toBe(50);
  //     items = rose.updateQuality(); // second update to reduce sellIn to 0 and test one more time
  //     expect(items[0].quality).toBe(50);
  //   });

  //   it('should increase in quality twice after sellIn is zero', () => {
  //     const cheese = new GildedRose([new Item('Aged Brie', 0, 5)]);
  //     let updated_cheese = cheese.updateQuality();
  //     expect(updated_cheese[0].quality).toBe(7);
  //   });

  //   it('should increase in quality as sellIn approaches zero', () => {
  //     const cheese = new GildedRose([new Item('Aged Brie', 1, 5)]);
  //     let updated_cheese = cheese.updateQuality();
  //     expect(updated_cheese[0].quality).toBe(6);
  //     expect(updated_cheese[0].sellIn).toBe(0);
  //   })
  // });

  // describe('Sulfuras', () => {
  //   it('quality should always be 80', () => {
  //     const sulfuras = new GildedRose([new Item('Sulfuras, Hand of Ragnaros', 0, 80)]);
  //     let updated_sulfaras = sulfuras.updateQuality();
  //     expect(updated_sulfaras[0].quality).toBe(80);
  //   });

  //   it('quality should be 80 when sellIn approaches 0', () => {
  //     const sulfuras = new GildedRose([new Item('Sulfuras, Hand of Ragnaros', 1, 80)]);
  //     let updated_sulfaras = sulfuras.updateQuality();
  //     expect(updated_sulfaras[0].quality).toBe(80);
  //   })
  // });

  // describe('Backstage Passes', () => {
  //   it('should quality + 1 as sellIn - 1 if sellIn > 10', () => {
  //     const pass = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 15, 5)]);
  //     let updated_pass = pass.updateQuality();
  //     expect(updated_pass[0].quality).toBe(6);
  //     expect(updated_pass[0].sellIn).toBe(14);
  //   });
    
  //   it('should quality + 2 as 5 < sellIn <= 10', () => {
  //     const pass = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 8, 5)]);
  //     let updated_pass = pass.updateQuality();
  //     expect(updated_pass[0].quality).toBe(7);
  //     expect(updated_pass[0].sellIn).toBe(7);
  //   });

  //   it('should quality + 3 as 0 <= sellIn <= 5', () => {
  //     const pass = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 3, 5)]);
  //     let updated_pass = pass.updateQuality();
  //     expect(updated_pass[0].quality).toBe(8);
  //     expect(updated_pass[0].sellIn).toBe(2);
  //   });

  //   it('quality should be zero after sellIn is zero', () => {
  //     const pass = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 0, 5)]);
  //     let updated_pass = pass.updateQuality();
  //     expect(updated_pass[0].quality).toBe(0);
  //     updated_pass = pass.updateQuality();
  //     expect(updated_pass[0].quality).toBe(0); // second update to check if it remains 0
  //   });

  //   it('should not go above 50', () => {
  //     const rose = new GildedRose([new Item('Backstage passes to a TAFKAL80ETC concert', 5, 50)]);
  //     let items = rose.updateQuality();
  //     expect(items[0].quality).toBe(50);
  //     items = rose.updateQuality(); // second update to reduce sellIn to 0 and test one more time
  //     expect(items[0].quality).toBe(50);
  //   });
  // });





  /*
  - item creation (see example above)
  - normal item: 0 <= quality <= 50, quality -1 as sellIn -1
  - brie: 0 <= quality <= 50, quality + 1 as sellIn - 1, quality + 2 as sellIn < 0
  -sulfuras: quality == 80
  - backstage: 0 <= quality <= 50, quality +1 as sellIn - 1 when sellIn > 10
    quality + 2 as 5 < sellIn <= 10, quality + 3 as 0 <= sellIn <= 5, quality == 0 when sellIn < 0 
  - quality changes
    - quality deteriorates (-1 per day ASSUMPTION) for most items
    - brie quality rises over time (+1 per day ASSUMPTION)
    - "sulfuras" item quality does not change
    - "backstage passes" item quality rises faster and faster as sellIn approaches 0, and then is set to 0 after that date
      - (starts at +1 quality per day ASSUMPTION)
      - +2 quality per day when 5 < sellIn <= 10
      - +3 quality per day when 0 <= sellIn <= 5
    - 0 <= quality <= 50
      - "sulfuras" has a quality outside the set range (80)
  - "conjured" items
    - same as normal items, but degrade in quality at double speed
  - DO NOT EDIT:
    - Item class (name, sellIn, quality)
    - Items property of GildedRose class
  */
});

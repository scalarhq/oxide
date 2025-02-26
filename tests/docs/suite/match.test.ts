import { expect } from "chai";
import {
   Option,
   Some,
   SomeIs,
   None,
   Result,
   Ok,
   Err,
   match,
   _,
} from "../../../src";

export default function match_tests() {
   {
      const num: Option<number> = Some(10);
      const res = match(num, {
         Some: (n) => n + 1,
         None: () => 0,
      });

      it("Basic Matching (mapped)", () => expect(res).to.equal(11));
   }

   {
      const matchNest = (input: Result<Option<number>, string>) =>
         match(input, {
            Ok: match({
               Some: (n) => `num ${n}`,
            }),
            _: () => "nothing",
         });

      it("Basic Matching (mapped 2)", () => {
         expect(matchNest(Ok(Some(10)))).to.equal("num 10");
         expect(matchNest(Ok(None))).to.equal("nothing");
         expect(matchNest(Err("none"))).to.equal("nothing");
      });
   }

   {
      const matchNum = (num: number) =>
         match(num, [
            [5, "five"],
            [(n) => n > 100, "big number"],
            [(n) => n < 0, (n) => `negative ${n}`],
            () => "other",
         ]);

      it("Basic Matching (number)", () => {
         expect(matchNum(5)).to.equal("five");
         expect(matchNum(150)).to.equal("big number");
         expect(matchNum(-20)).to.equal("negative -20");
         expect(matchNum(50)).to.equal("other");
      });
   }

   {
      const matchObj = (obj: { a: number; b: { c: number } }) =>
         match(obj, [
            [{ a: 5 }, "a is 5"],
            [{ b: { c: 5 } }, "c is 5"],
            [{ a: 10, b: { c: (n) => n > 10 } }, "a 10 c gt 10"],
            () => "other",
         ]);

      it("Basic Matching (object)", () => {
         expect(matchObj({ a: 5, b: { c: 5 } })).to.equal("a is 5");
         expect(matchObj({ a: 50, b: { c: 5 } })).to.equal("c is 5");
         expect(matchObj({ a: 10, b: { c: 20 } })).to.equal("a 10 c gt 10");
         expect(matchObj({ a: 8, b: { c: 8 } })).to.equal("other");
      });
   }

   {
      const matchArr = (arr: number[]) =>
         match(arr, [
            [[1], "1"],
            [[2, (n) => n > 10], "2 gt10"],
            [[_, 6, _, 12], "_ 6 _ 12"],
            () => "other",
         ]);

      it("Basic Matching (array)", () => {
         expect(matchArr([1, 2, 3])).to.equal("1");
         expect(matchArr([2, 12, 6])).to.equal("2 gt10");
         expect(matchArr([3, 6, 9, 12])).to.equal("_ 6 _ 12");
         expect(matchArr([2, 4, 6])).to.equal("other");
      });
   }

   interface Player {
      name: string;
      age: number;
      status: string;
   }

   const player1: Player = { name: "Paul", age: 80, status: "ok" };
   const player2: Player = { name: "SuperKing77", age: 12, status: "ok" };
   const player3: Player = { name: "BadGuy99", age: 24, status: "banned" };

   function can_proceed_1(player: Option<Player>): boolean {
      return match(player, {
         Some: (pl) => pl.age >= 18 && pl.status !== "banned",
         None: () => false,
      });
   }

   it("can_proceed (1)", () => {
      expect(can_proceed_1(Some(player1))).to.be.true;
      expect(can_proceed_1(Some(player2))).to.be.false;
      expect(can_proceed_1(Some(player3))).to.be.false;
      expect(can_proceed_1(None)).to.be.false;
   });

   function can_proceed_2(player: Option<Player>): boolean {
      return match(player, {
         Some: [
            [{ status: "banned" }, false],
            [{ age: (n) => n > 18 }, true],
         ],
         _: () => false,
      });
   }

   it("can_proceed (2)", () => {
      expect(can_proceed_2(Some(player1))).to.be.true;
      expect(can_proceed_2(Some(player2))).to.be.false;
      expect(can_proceed_2(Some(player3))).to.be.false;
      expect(can_proceed_2(None)).to.be.false;
   });

   function can_proceed_3(player: Option<Player>): boolean {
      return match(player, [
         [Some({ status: "banned" }), false],
         [SomeIs((pl) => pl.age >= 18), true],
         () => false,
      ]);
   }

   it("can_proceed (3)", () => {
      expect(can_proceed_3(Some(player1))).to.be.true;
      expect(can_proceed_3(Some(player2))).to.be.false;
      expect(can_proceed_3(Some(player3))).to.be.false;
      expect(can_proceed_3(None)).to.be.false;
   });
}

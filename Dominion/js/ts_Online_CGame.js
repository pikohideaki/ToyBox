/*
 * CGameクラスの定義ファイル．
 * グローバルに使用されるGameオブジェクト．
 */
var CGame = (function () {
    function CGame(FBobj_Game) {
        if (FBobj_Game === undefined) {
            TrashPile = [];
            whose_turn_id = 0;
            TurnInfo = {};
            phase = '';
            Supply = new CSupply();
            Players = [];
            Settings = {};
            StackedCardIDs = [];
        }
        else {
            TrashPile = (FBobj_Game.TrashPile || []);
            whose_turn_id = FBobj_Game.whose_turn_id;
            TurnInfo = FBobj_Game.TurnInfo;
            phase = FBobj_Game.phase;
            Supply = new CSupply(FBobj_Game.Supply);
            Players = [];
            FBobj_Game.Players = (FBobj_Game.Players || []);
            for (var i = 0; i < RoomInfo.PlayerNum; ++i) {
                Players[i] = new CPlayer(FBobj_Game.Players[i]);
            }
            Settings = (FBobj_Game.Settings || {});
            StackedCardIDs = (FBobj_Game.StackedCardIDs || []);
        }
    }
    CGame.prototype.NextPlayerID = function (current_player_id) {
        if (current_player_id === void 0) { current_player_id = whose_turn_id; }
        /* 0 -> 1 -> 2 -> 3 -> 0 */
        return (current_player_id + 1) % Players.length;
    };
    CGame.prototype.PreviousPlayerID = function (current_player_id) {
        if (current_player_id === void 0) { current_player_id = whose_turn_id; }
        return (Players.length + current_player_id - 1) % Players.length;
    };
    CGame.prototype.Me = function () {
        return Players[myid];
    };
    CGame.prototype.player = function () {
        return Players[whose_turn_id];
    };
    CGame.prototype.NextPlayer = function (current_player_id) {
        if (current_player_id === void 0) { current_player_id = whose_turn_id; }
        return Players[NextPlayerID(current_player_id)];
    };
    CGame.prototype.PreviousPlayer = function (current_player_id) {
        if (current_player_id === void 0) { current_player_id = whose_turn_id; }
        return Players[PreviousPlayerID(current_player_id)];
    };
    CGame.prototype.whose_turn = function () {
        return player.name;
    };
    CGame.prototype.GetAllCards = function () {
        var AllCards = [];
        Players.forEach(function (player) {
            AllCards = AllCards.concat(player.GetCopyOfAllCards());
        });
        AllCards = AllCards.concat(Supply.GetAllCards());
        AllCards = AllCards.concat(TrashPile);
        return AllCards;
    };
    CGame.prototype.MovePhase = function (phase) {
        var G = this;
        return MyAsync(function* () {
            G.phase = phase;
            yield FBref_Game.child('phase').set(G.phase);
            var phase_jp;
            switch (G.phase) {
                case 'ActionPhase':
                    phase_jp = 'アクションフェーズ';
                    break;
                case 'BuyPhase':
                    $('.UseAllTreasures').show(); // 1度だけ表示
                    phase_jp = '購入フェーズ';
                    break;
            }
            $('.phase-dialog-wrapper .dialog_text').html(phase_jp);
            yield new Promise(function (resolve) {
                $('.phase-dialog-wrapper').fadeIn().delay(300).fadeOut('normal', resolve);
            });
        });
    };
    CGame.prototype.ResetTurnInfo = function () {
        TurnInfo = {
            action: 1,
            buy: 1,
            coin: 0,
            potion: 0,
            played_actioncards_num: 0,
            add_copper_coin: 0,
            cost_down_by_Bridge: 0,
            Revealed_Moat: new Array(PLAYER_NUM_MAX).fill(false),
            Revealed_BaneCard: new Array(PLAYER_NUM_MAX).fill(false),
        };
        phase = 'ActionPhase';
    };
    CGame.prototype.GameEnded = function () {
        // 属州がなくなったら終了
        if (Supply.byName('Province').IsEmpty())
            return true;
        // 植民地場なら植民地がなくなったら終了
        if (Supply.byName('Colony').in_use
            && Supply.byName('Colony').IsEmpty())
            return true;
        // 使用しているサプライが3山なくなったら終了
        /* [ToDo] 闇市場，廃墟などもカウント */
        var empty_pile_num = [].concat(Supply.Basic, Supply.KingdomCards, [Supply.BaneCard])
            .filter(function (pile) { return pile.in_use && pile.IsEmpty(); })
            .length;
        return (empty_pile_num >= 3);
    };
    CGame.prototype.MoveToNextPlayer = function () {
        var G = this;
        return MyAsync(function* () {
            var Room_updates = {};
            G.player().CleanUp();
            Room_updates["Game/Players/" + G.whose_turn_id] = G.player();
            if (G.GameEnded()) {
                G.Players.forEach(function (player, id) {
                    player.SumUpVP();
                    Room_updates["Game/Players/" + id] = player;
                });
                Room_updates['RoomInfo/Status'] = 'ゲーム終了';
                Room_updates['GameEnd'] = true;
                yield FBref_Room.update(Room_updates);
                return;
            }
            G.whose_turn_id = G.NextPlayerID();
            G.ResetTurnInfo();
            Room_updates['Game/whose_turn_id'] = G.whose_turn_id;
            Room_updates['Game/TurnInfo'] = G.TurnInfo;
            Room_updates['Game/phase'] = G.phase;
            yield Promise.all([
                FBref_Room.update(Room_updates),
                FBref_chat.push(G.player().name + "\u306E\u30BF\u30FC\u30F3"),
            ]);
            /* アクションカードがなければスキップして購入フェーズに遷移 */
            if (!G.player().HasActionCard()) {
                yield G.MovePhase('BuyPhase');
            }
        });
    };
    // card_no のコスト
    CGame.prototype.GetCost = function (card_no, player_id) {
        if (player_id === void 0) { player_id = whose_turn_id; }
        var cost = new CCost(Cardlist[card_no]);
        // 橋によるコスト減少量
        cost = CostOp('-', cost, new CCost([TurnInfo.cost_down_by_Bridge, 0, 0]));
        var playarea = Players[player_id].PlayArea;
        // 街道（場にある枚数）
        var Highway_num_in_play = playarea.filter(function (card) { return Cardlist[card.card_no].name_eng == 'Highway'; }).length;
        // 石切場（場にある枚数）
        var Quarry_num_in_play = playarea.filter(function (card) { return Cardlist[card.card_no].name_eng == 'Quarry'; }).length;
        // 王女（場にある枚数）
        var Princess_num_in_play = playarea.filter(function (card) { return Cardlist[card.card_no].name_eng == 'Princess'; }).length;
        // 橋の下のトロル（場にある枚数）
        var BridgeTroll_num_in_play = playarea.filter(function (card) { return Cardlist[card.card_no].name_eng == 'Bridge Troll'; }).length;
        cost = CostOp('-', cost, new CCost([Highway_num_in_play, 0, 0]));
        cost = CostOp('-', cost, new CCost([BridgeTroll_num_in_play, 0, 0]));
        cost = CostOp('-', cost, new CCost([Princess_num_in_play * 2, 0, 0]));
        if (IsActionCard(Cardlist, card_no)) {
            cost = CostOp('-', cost, new CCost([Quarry_num_in_play, 0, 0]));
        }
        if (cost.coin < 0)
            cost.coin = 0; // 0未満にはならない
        return cost;
    };
    CGame.prototype.StackCardID = function (card_ID) {
        StackedCardIDs.push(card_ID);
        return FBref_StackedCardIDs.set(StackedCardIDs);
    };
    /* カード移動基本操作 */
    CGame.prototype.GetCardWithID = function (card_ID, remove_this_card) {
        if (remove_this_card === void 0) { remove_this_card = true; }
        var card = new CCard();
        var matched_num = 0;
        var G = this;
        for (var i = 0; i < G.Players.length; ++i) {
            var pl = G.Players[i];
            for (var k = 0; k < pl.Deck.length; ++k) {
                if (card_ID === pl.Deck[k].card_ID) {
                    card = pl.Deck[k];
                    if (remove_this_card)
                        pl.Deck.remove(k);
                    matched_num++;
                }
            }
            for (var k = 0; k < pl.DiscardPile.length; ++k) {
                if (card_ID === pl.DiscardPile[k].card_ID) {
                    card = pl.DiscardPile[k];
                    if (remove_this_card)
                        pl.DiscardPile.remove(k);
                    matched_num++;
                }
            }
            for (var k = 0; k < pl.HandCards.length; ++k) {
                if (card_ID === pl.HandCards[k].card_ID) {
                    card = pl.HandCards[k];
                    if (remove_this_card)
                        pl.HandCards.remove(k);
                    matched_num++;
                }
            }
            for (var k = 0; k < pl.PlayArea.length; ++k) {
                if (card_ID === pl.PlayArea[k].card_ID) {
                    card = pl.PlayArea[k];
                    if (remove_this_card)
                        pl.PlayArea.remove(k);
                    matched_num++;
                }
            }
            for (var k = 0; k < pl.Aside.length; ++k) {
                if (card_ID === pl.Aside[k].card_ID) {
                    card = pl.Aside[k];
                    if (remove_this_card)
                        pl.Aside.remove(k);
                    matched_num++;
                }
            }
            for (var k = 0; k < pl.Open.length; ++k) {
                if (card_ID === pl.Open[k].card_ID) {
                    card = pl.Open[k];
                    if (remove_this_card)
                        pl.Open.remove(k);
                    matched_num++;
                }
            }
        }
        for (var i = 0; i < G.Supply.Basic.length; ++i) {
            var spl = G.Supply.Basic[i].pile;
            for (var k = 0; k < spl.length; ++k) {
                if (card_ID === spl[k].card_ID) {
                    card = spl[k];
                    if (remove_this_card)
                        spl.remove(k);
                    matched_num++;
                }
            }
        }
        for (var i = 0; i < G.Supply.KingdomCards.length; ++i) {
            var spl = G.Supply.KingdomCards[i].pile;
            for (var k = 0; k < spl.length; ++k) {
                if (card_ID === spl[k].card_ID) {
                    card = spl[k];
                    if (remove_this_card)
                        spl.remove(k);
                    matched_num++;
                }
            }
        }
        for (var i = 0; i < G.Supply.Prize.length; ++i) {
            var spl = G.Supply.Prize[i].pile;
            for (var k = 0; k < spl.length; ++k) {
                if (card_ID === spl[k].card_ID) {
                    card = spl[k];
                    if (remove_this_card)
                        spl.remove(k);
                    matched_num++;
                }
            }
        }
        {
            var spl = G.Supply.BaneCard.pile;
            for (var k = 0; k < spl.length; ++k) {
                if (card_ID === spl[k].card_ID) {
                    card = spl[k];
                    if (remove_this_card)
                        spl.remove(k);
                    matched_num++;
                }
            }
        }
        for (var k = 0; k < G.TrashPile.length; ++k) {
            if (card_ID === G.TrashPile[k].card_ID) {
                card = G.TrashPile[k];
                if (remove_this_card)
                    G.TrashPile.remove(k);
                matched_num++;
            }
        }
        if (matched_num < 1) {
            throw new Error("the card with ID:\"" + card_ID + "\" not found.");
        }
        if (matched_num > 1) {
            throw new Error("2 or more cards with ID:\"" + card_ID + "\" found.");
        }
        return card;
    };
    CGame.prototype.LookCardWithID = function (card_ID) {
        return GetCardWithID(card_ID, false);
    };
    CGame.prototype.UseCard = function (playing_card_no, playing_card_ID) {
        var G = this;
        return MyAsync(function* () {
            if (G.phase === 'ActionPhase' && !IsActionCard(Cardlist, playing_card_no)) {
                MyAlert('アクションカードを選んでください');
                return;
            }
            if (G.phase === 'BuyPhase' && !IsTreasureCard(Cardlist, playing_card_no)) {
                MyAlert('財宝カードを選んでください');
                return;
            }
            if (IsActionCard(Cardlist, playing_card_no) && G.TurnInfo.action <= 0) {
                MyAlert('アクションが足りません');
                return;
            }
            switch (G.phase) {
                case 'ActionPhase':
                    G.phase = 'ActionPhase*';
                    break;
                case 'BuyPhase':
                    G.phase = 'BuyPhase*';
                    break;
                default:
                    throw new Error('GetCardEffect should be called in ActionPhase or BuyPhase');
                    break;
            }
            G.player().Play(playing_card_ID, G); /* カード移動 */
            // アクションを1消費
            if (IsActionCard(Cardlist, playing_card_no))
                G.TurnInfo.action--;
            yield FBref_Game.update((_a = {
                    phase: G.phase
                },
                _a["Players/" + G.whose_turn_id + "/PlayArea"] = G.player().PlayArea,
                _a["Players/" + G.whose_turn_id + "/HandCards"] = G.player().HandCards,
                _a['TurnInfo/action'] = G.TurnInfo.action,
                _a));
            yield MyAsync(GetCardEffect, playing_card_ID);
            // 終了
            switch (G.phase) {
                case 'ActionPhase*':
                    G.phase = 'ActionPhase';
                    break;
                case 'BuyPhase*':
                    G.phase = 'BuyPhase';
                    break;
                default:
                    throw new Error('GetCardEffect should be called in ActionPhase or BuyPhase');
                    break;
            }
            // actionが0なら自動でアクションフェーズ終了
            if (G.phase == 'ActionPhase' && G.TurnInfo.action <= 0) {
                yield G.MovePhase('BuyPhase');
            }
            else {
                yield FBref_Game.child('phase').set(G.phase);
            }
            var _a;
        });
    };
    // カードを獲得する
    CGame.prototype.GainCard = function (card_ID, place_to_gain, player_id, face, buy) {
        if (place_to_gain === void 0) { place_to_gain = 'DiscardPile'; }
        if (player_id === void 0) { player_id = whose_turn_id; }
        if (face === void 0) { face = 'default'; }
        if (buy === void 0) { buy = false; }
        var player = Game.Players[player_id];
        var card_no = Game.LookCardWithID(card_ID).card_no;
        var G = this;
        return MyAsync(function* () {
            if (face == 'up')
                G.FaceUpCard(card_ID);
            if (face == 'down')
                G.FaceDownCard(card_ID);
            var player = G.Players[player_id];
            var Game_updates = {};
            Game_updates['Supply'] = G.Supply;
            switch (place_to_gain) {
                case 'Deck':
                    player.AddToDeck(G.GetCardWithID(card_ID));
                    Game_updates["Players/" + player_id + "/Deck"] = player.Deck;
                    break;
                case 'HandCards':
                    player.AddToHandCards(G.GetCardWithID(card_ID));
                    Game_updates["Players/" + player_id + "/HandCards"] = player.HandCards;
                    break;
                case 'DiscardPile':
                    player.AddToDiscardPile(G.GetCardWithID(card_ID));
                    Game_updates["Players/" + player_id + "/DiscardPile"] = player.DiscardPile;
                    break;
                default:
                    throw new Error("at Game.GainCard : there is no place named " + place_to_gain);
                    return;
            }
            FBref_chat.push(player.name + "\u304C\u300C" + Cardlist[card_no].name_jp + "\u300D\u3092" + (buy ? '購入' : '獲得') + "\u3057\u307E\u3057\u305F\u3002");
            yield FBref_Game.update(Game_updates);
        });
    };
    // サプライからカードを獲得する
    CGame.prototype.GainCardFromSupply = function (card_ID, place_to_gain, player_id, face, buy) {
        if (place_to_gain === void 0) { place_to_gain = 'DiscardPile'; }
        if (player_id === void 0) { player_id = whose_turn_id; }
        if (face === void 0) { face = 'default'; }
        if (buy === void 0) { buy = false; }
        GainCard(card_ID, place_to_gain, player_id, face, buy);
        return FBref_Game.update((_a = {},
            _a["Players/" + player_id + "/" + place_to_gain] = Game.Players[player_id][place_to_gain],
            _a.Supply = Game.Supply,
            _a));
        var _a;
    };
    // カードを購入する
    CGame.prototype.BuyCard = function (card_ID, place_to_gain, player_id, face) {
        if (place_to_gain === void 0) { place_to_gain = 'DiscardPile'; }
        if (player_id === void 0) { player_id = whose_turn_id; }
        if (face === void 0) { face = 'default'; }
        GainCard(card_ID, place_to_gain, player_id, face, true);
    };
    // サプライからカードを購入する
    CGame.prototype.BuyCardFromSupply = function (card_ID, place_to_gain, player_id, face) {
        if (place_to_gain === void 0) { place_to_gain = 'DiscardPile'; }
        if (player_id === void 0) { player_id = whose_turn_id; }
        if (face === void 0) { face = 'default'; }
        return GainCardFromSupply(card_ID, place_to_gain, player_id, face, true);
    };
    // カードをサプライから獲得する
    CGame.prototype.GainCardFromSupplyByName = function (card_name_eng, place_to_gain, player_id, face) {
        if (place_to_gain === void 0) { place_to_gain = 'DiscardPile'; }
        if (player_id === void 0) { player_id = whose_turn_id; }
        if (face === void 0) { face = 'default'; }
        var G = this;
        return MyAsync(function* () {
            var SupplyTopCard = G.Supply.byName(card_name_eng).LookTopCard();
            if (SupplyTopCard == undefined) {
                yield MyAlert('獲得できるカードがありません。');
                return;
            }
            yield G.GainCardFromSupply(SupplyTopCard.card_ID, place_to_gain, player_id, face);
        });
    };
    /* カード移動基本操作 */
    CGame.prototype.AddToTrashPile = function (card) {
        if (card == undefined)
            return;
        TrashPile.push(card);
    };
    /* カード移動複合操作 */
    /* どこから来るか分からないのでfirebase同期はしない */
    CGame.prototype.Trash = function (card_ID) {
        AddToTrashPile(GetCardWithID(card_ID));
        FBref_chat.push("\u300C" + Cardlist[LookCardWithID(card_ID).card_no].name_jp + "\u300D\u3092\u5EC3\u68C4\u3057\u307E\u3057\u305F\u3002");
    };
    CGame.prototype.FaceUpCard = function (card_ID) {
        LookCardWithID(card_ID).face = 'up';
        return StackCardID(card_ID);
    };
    CGame.prototype.FaceDownCard = function (card_ID) {
        LookCardWithID(card_ID).face = 'down';
        return StackCardID(card_ID);
    };
    CGame.prototype.ResetStackedCardIDs = function () {
        StackedCardIDs = [];
        return FBref_StackedCardIDs.set([]);
    };
    CGame.prototype.ResetFace = function () {
        var G = this;
        G.StackedCardIDs.forEach(function (card_ID) { return G.LookCardWithID(card_ID).face = 'default'; });
        return G.ResetStackedCardIDs();
    };
    CGame.prototype.ResetClassStr = function () {
        var G = this;
        G.StackedCardIDs.forEach(function (card_ID) { return G.LookCardWithID(card_ID).class_str = ''; });
        return G.ResetStackedCardIDs();
    };
    CGame.prototype.ForAllPlayers = function (func) {
        var G = this;
        if (func instanceof function* () { yield; }.constructor) {
            return MyAsync(function* () {
                yield MyAsync(func, G.whose_turn_id); // 自分
                for (var player_id = G.NextPlayerID(); player_id != G.whose_turn_id; player_id = G.NextPlayerID(player_id)) {
                    yield MyAsync(func, player_id);
                }
            });
        }
        else {
            func(G.whose_turn_id);
            for (var player_id = G.NextPlayerID(); player_id != G.whose_turn_id; player_id = G.NextPlayerID(player_id)) {
                func(player_id);
            }
        }
    };
    CGame.prototype.ForAllOtherPlayers = function (func) {
        var G = this;
        if (func instanceof function* () { yield; }.constructor) {
            return MyAsync(function* () {
                for (var player_id = G.NextPlayerID(); player_id != G.whose_turn_id; player_id = G.NextPlayerID(player_id)) {
                    yield MyAsync(func, player_id);
                }
            });
        }
        else {
            for (var player_id = G.NextPlayerID(); player_id != G.whose_turn_id; player_id = G.NextPlayerID(player_id)) {
                func(player_id);
            }
            return Promise.resolve();
        }
    };
    CGame.prototype.AttackAllOtherPlayers = function (card_name, message, send_signals, attack_effect) {
        if (attack_effect === void 0) { attack_effect = function* () { }; }
        var G = this;
        return G.ForAllOtherPlayers(function* (player_id) {
            if (G.TurnInfo.Revealed_Moat[player_id])
                return; // 堀を公開していたらスキップ
            yield FBref_MessageTo.child(player_id).set(message);
            if (send_signals) {
                yield FBref_SignalAttackEnd.set(false); /* reset */
                FBref_SignalAttackEnd.on('value', function (snap) {
                    if (snap.val())
                        Resolve[card_name]();
                });
                yield SendSignal(player_id, {
                    Attack: true,
                    card_name: card_name,
                    Message: message,
                });
                yield new Promise(function (resolve) { return Resolve[card_name] = resolve; }); /* 他のプレイヤー待機 */
                FBref_SignalAttackEnd.off(); // 監視終了
            }
            yield MyAsync(attack_effect, player_id);
            yield FBref_MessageTo.child(player_id).set('');
        });
    };
    return CGame;
}());

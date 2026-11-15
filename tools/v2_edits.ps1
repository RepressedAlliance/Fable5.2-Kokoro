param([string[]]$Only = @(), [int]$Throttle = 12, [switch]$NoPad)   # -NoPad: send the references as they are (some masters keep their shape better unpadded)
$ErrorActionPreference = 'Stop'
# The redo (v2): the drawings that follow each set-up's master. Every one is the master redrawn with ONE thing changed;
# the drawings between two poses are made from both neighbours. Masters: art/v2/raw/<set>0_<pick>.png.
#   pwsh tools/v2_edits.ps1 [-Only tw,tf,...]
$Only = @($Only | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
# (in this repository it is kept as a prompt library: the raw drawings in art/v2/raw and art/v2/picks.json are not published)
$R = Join-Path $root 'art\v2\raw'
$C = Join-Path $root 'art\canon'
$pick = Get-Content -Raw -LiteralPath (Join-Path $root 'art\v2\picks.json') | ConvertFrom-Json -AsHashtable

$bg = 'the same flat magenta (#FF00FF) background, no ground, no cast shadow, no motion lines, no blur, no text other than the "02" on the android''s upper arm, no watermark.'
$bgL = $bg.Replace(' other than the "02" on the android''s upper arm', ' or numbers anywhere')
$sameR = 'Redraw the FIRST attached image EXACTLY: the same android girl, the same view, the same picture size and framing, the same SIZE and POSITION of her head and body in the picture, the same proportions (do not change the length or thickness of any limb), the same face and the same EYES (shape, size, teal color, concentric ring), hair, hair clips, bow, ear units, collar, neckerchief, dress, sphere joints and dark-blue flared boots, the same line weight, colors, flat fills and shadow shapes, ' + $bg + ' The whole figure stays inside the picture. Anything not named below must be traced unchanged from the first image. CHANGE ONLY THIS:'
$sameB = $sameR.Replace('The whole figure stays inside the picture.', 'It stays a close-up cropped only by the bottom edge of the picture.')
$sameL = 'Redraw the FIRST attached image EXACTLY: the same man, the same view, the same picture size and framing, the same SIZE and POSITION of his head and body in the picture, the same proportions, the same face, hair, small ponytail, white lab coat, dark navy shirt, yellow necktie, trousers and shoes, the same stool seat under him if there is one, the same line weight, colors, flat fills and shadow shapes, ' + $bgL + ' Anything not named below must be traced unchanged from the first image. CHANGE ONLY THIS:'
$sameK = $sameL.Replace('the same man', 'the same little boy').Replace('white lab coat, dark navy shirt, yellow necktie, trousers and shoes', 'navy jumper, shorts, socks and shoes, the same sheet of paper and crayons on the floor')
$sameD = 'Redraw the FIRST attached image EXACTLY: the same two whole figures standing on the same ground line, the same picture size and framing, the same SIZE and POSITION of both heads and bodies in the picture, the same heights (the top of her hair level with his mouth), the same proportions, faces, hair and clothes, the same line weight, colors, flat fills and shadow shapes, ' + $bg + ' The android girl on the right is a machine: perfectly upright and still, face blank, eyes with NO catchlight. Anything not named below must be traced unchanged from the first image. CHANGE ONLY THIS:'
$inbHead = 'This is ONE IN-BETWEEN drawing for hand-drawn animation. The FIRST attached image is the finished drawing just BEFORE this one, the SECOND attached image is the finished drawing just AFTER it, in the same shot from the same fixed camera. Match them exactly: the same picture size and framing, the same SIZE and POSITION of the head(s) and body(ies) in the picture with no change of scale, the same faces and eyes, the same line weight, colors and shadow shapes, ' + $bg + ' Whatever is the same in both drawings must be traced unchanged; everything that moves is part way between the two drawings; nothing new appears. THIS MOMENT:'
$armNote = ' The arms are exactly as long as in the first image: only their angle changes.'
$tray = 'the small round silver tray with the teapot and the cup'
$windOnly = 'The head shape, the face, the ear unit, the headband and the whole body are traced unchanged.'

$sets = [ordered]@{
  tw = @{ same = $sameR; items = [ordered]@{
    tw_c1 = 'she is WALKING toward the viewer''s left with a slow, even, mechanical step. CONTACT: the leg nearer the viewer is forward, its heel just touching the ground, knee nearly straight; the far leg is behind, its toe on the ground. It is a SHORT step: the two boots are about one boot-length apart. Both legs keep exactly the length they have in the first image, and both boots rest on the SAME ground line as the boots in the first image (the soles at the same height in the picture): do not shorten the legs or the boots. Her upper body, arms, tray and head are unchanged and perfectly upright.'
    tw_p1 = 'she is WALKING toward the viewer''s left with a slow, even, mechanical step. PASSING: she stands on the leg nearer the viewer, straight under her body; the far leg is lifted with the knee bent, its boot passing the standing leg just clear of the ground. Her upper body, arms, tray and head are unchanged and perfectly upright.'
    tw_p2 = 'she is WALKING toward the viewer''s left with a slow, even, mechanical step. PASSING: she stands on the FAR leg, straight under her body; the leg nearer the viewer is lifted with the knee bent, its boot passing the standing leg just clear of the ground. Her upper body, arms, tray and head are unchanged and perfectly upright.'
    tw_off = 'she now holds the tray level in her FAR hand alone at waist height, and with the hand nearer the viewer she holds the cup on its saucer OUT in front of her (toward the viewer''s left) at chest height, the elbow still a little bent: offering it to someone. Only the teapot is left on the tray.' + $armNote
    tw_fl = 'a small white daisy stands in the round socket on her chest: seen from the side, its short stem and its flower stick out in front of her collar (toward the viewer''s left). Both hands hold the tray exactly as in the first image.'
  }; inb = [ordered]@{
    tw_c2 = @{ refs = @('tw_p1', 'tw_p2'); text = 'the moment between the two: BOTH boots are on the ground in a SHORT step - the FAR leg has just landed in front of her, heel on the ground, knee nearly straight; the leg nearer the viewer is behind her, its toe on the ground. The two boots are about one boot-length apart, both on the same ground line as the standing boot of the first image; the legs keep their full length. Her upper body, arms, tray and head are exactly as in both images.' }
    tw_c1p1 = @{ refs = @('tw_c1', 'tw_p1'); text = 'half way between the two: the leg nearer the viewer now carries her weight, its boot flat on the ground a little in front of her body; the far leg has just left the ground behind her, knee beginning to bend.' }
    tw_p1c2 = @{ refs = @('tw_p1', 'tw_c2'); text = 'half way between the two: she stands on the leg nearer the viewer, now a little behind her body; the far leg swings forward, its knee straightening, its heel reaching toward the ground in front.' }
    tw_c2p2 = @{ refs = @('tw_c2', 'tw_p2'); text = 'half way between the two: the far leg now carries her weight, its boot flat on the ground a little in front of her body; the leg nearer the viewer has just left the ground behind her, knee beginning to bend.' }
    tw_p2c1 = @{ refs = @('tw_p2', 'tw_c1'); text = 'half way between the two: she stands on the far leg, now a little behind her body; the leg nearer the viewer swings forward, its knee straightening, its heel reaching toward the ground in front.' }
  } }
  tf = @{ same = $sameR; items = [ordered]@{
    tf_b = 'her eyes are half closed in a slow mechanical blink: the upper lids cover the top half of the irises. Nothing else changes.'
    tf_pour = 'she holds the tray level in her LEFT hand (viewer''s right) alone; her RIGHT hand (viewer''s left) has lifted the teapot and tilts it, pouring one thin straight stream of tea down into the cup on the tray. Her eyes are lowered to the cup.' + $armNote
    tf_offer = 'she holds the tray (with the teapot) lower, in her LEFT hand (viewer''s right) alone; her RIGHT hand (viewer''s left) holds the cup on its saucer straight out toward the viewer at chest height - offering it - so the forearm is foreshortened and the cup is drawn a little larger. Her eyes look straight at the viewer, blank.'
    tf_see = 'she holds the tray level in her LEFT hand (viewer''s right) alone; in her RIGHT hand (viewer''s left), raised in front of her chest, she holds a small white daisy on a short green stem by the stem; her head is bowed a little and her eyes look at the flower, blank, not understanding.' + $armNote
    tf_put = 'she holds the tray level in her LEFT hand (viewer''s right) alone; with her RIGHT hand (viewer''s left) she is pushing the short green stem of a small white daisy into the round socket on her chest; her head is bowed, eyes lowered to it.' + $armNote
    tf_done = 'a small white daisy now stands in the round socket on her chest, its flower facing the viewer. Both hands hold the tray again exactly as in the first image. Eyes straight ahead, blank.'
  }; inb = [ordered]@{
    tf_01 = @{ refs = @('tf0', 'tf_pour'); text = 'half way: her right hand has just lifted the teapot off the tray and is beginning to tilt it; no tea is pouring yet; her eyes are half way down toward the cup.' }
    tf_02 = @{ refs = @('tf0', 'tf_offer'); text = 'half way: her right hand has lifted the cup on its saucer off the tray and is half way out toward the viewer; the tray is half way lowered.' }
    tf_03 = @{ refs = @('tf0', 'tf_see'); text = 'half way: her right hand has left the tray and is half way up toward her chest, already holding the small white daisy by its stem; her head is beginning to bow.' }
    tf_34 = @{ refs = @('tf_see', 'tf_put'); text = 'half way: the hand with the daisy has turned the stem toward her chest and is half way to the socket; her head bows further.' }
    tf_45 = @{ refs = @('tf_put', 'tf_done'); text = 'half way: the daisy stands in the socket; her right hand has let go of it and is half way back down to the tray; her head is half way back up.' }
  } }
  tq = @{ same = $sameR; items = [ordered]@{
    tq_look = 'her head is bowed and her eyes are lowered: she is looking down at the empty dark socket on her own chest. Nothing else changes.'
    tq_down = 'she has bent her knees and crouched down low, back straight, and with both hands she is setting the tray down on the ground just in front of her boots; her head is bowed toward it. Her boots stay exactly where they were.' + $armNote
    tq_up = 'she stands upright again exactly where she stood, arms hanging relaxed at her sides, hands empty and open, head level, eyes straight ahead. The tray with its teapot and cup now stands on the ground just in front of her boots.' + $armNote
  }; inb = [ordered]@{
    tq_12 = @{ refs = @('tq_look', 'tq_down'); text = 'half way down: her knees are half bent, the tray is at the height of her knees on its way to the ground, her head bowed.' }
    tq_23 = @{ refs = @('tq_down', 'tq_up'); text = 'half way up: the tray stands on the ground in front of her boots; her hands have let go of it and her knees are half straightened, her body rising, head coming up.' }
  }; after = [ordered]@{
    tq_tray = @{ of = 'tq_up'; text = 'the android girl is GONE from the picture: ONLY the small round silver tray with its white teapot and its cup on a saucer stands there on the ground, exactly where and exactly as it is drawn in the first image (now seen whole, nothing in front of it or behind it). Nothing else is in the picture.' }
  } }
  tb = @{ same = $sameR; items = [ordered]@{
    tb_c1 = 'seen from behind, she is WALKING away from the viewer with a slow even step. CONTACT: her LEFT leg has stepped forward (away from the viewer: its boot is drawn only a very little higher in the picture) in a SHORT step; both legs keep exactly the length they have in the first image, and the toe of the rear boot rests on the same ground line as the boots in the first image, her RIGHT leg is behind with the heel lifted so that we see a little of the sole. Her right arm has swung a little forward and her left arm a little back. Head and body upright.'
    tb_p1 = 'seen from behind, she is WALKING away from the viewer with a slow even step. PASSING: she stands on her LEFT leg, straight; her RIGHT leg is lifted with the knee bent, its boot passing beside the left calf, clear of the ground. Both arms hang at her sides. Head and body upright.'
    tb_p2 = 'seen from behind, she is WALKING away from the viewer with a slow even step. PASSING: she stands on her RIGHT leg, straight; her LEFT leg is lifted with the knee bent, its boot passing beside the right calf, clear of the ground. Both arms hang at her sides. Head and body upright.'
  }; inb = [ordered]@{
    tb_c2 = @{ refs = @('tb_p1', 'tb_p2'); text = 'the moment between the two: BOTH boots are on the ground in a SHORT step - her RIGHT leg has just stepped forward (away from the viewer, its boot drawn only a very little higher in the picture), her LEFT leg is behind with the heel lifted so that we see a little of the sole. Both legs keep their full length; the toe of the rear boot is on the same ground line as the standing boot of the first image. Her left arm has swung a little forward and her right arm a little back. Head and body exactly as in both images.' }
    tb_c1p1 = @{ refs = @('tb_c1', 'tb_p1'); text = 'half way between the two: her left leg carries her weight; her right leg has just left the ground behind, knee beginning to bend; the arms half way back to her sides.' }
    tb_p1c2 = @{ refs = @('tb_p1', 'tb_c2'); text = 'half way between the two: she stands on her left leg; her right leg swings forward past it, reaching ahead; the left arm beginning to swing forward.' }
    tb_c2p2 = @{ refs = @('tb_c2', 'tb_p2'); text = 'half way between the two: her right leg carries her weight; her left leg has just left the ground behind, knee beginning to bend; the arms half way back to her sides.' }
    tb_p2c1 = @{ refs = @('tb_p2', 'tb_c1'); text = 'half way between the two: she stands on her right leg; her left leg swings forward past it, reaching ahead; the right arm beginning to swing forward.' }
  } }
  wl = @{ same = $sameR; items = [ordered]@{
    wl_r1 = 'she has raised the arm nearer the viewer up and forward (toward the viewer''s left), reaching high: the hand is above the height of her head, index finger extended, touching something in front of her. Her face is still lifted, eyes on her fingertip. ARM LENGTH: the raised arm is drawn at its full length - from the shoulder joint to the fingertip it is as long as the distance from her shoulder down to the middle of her thigh (in the first image the hanging arm reaches that far); the upper arm and the forearm are each as long as in the first image. Do not shorten it.'
    wl_r2 = 'the arm nearer the viewer is stretched straight forward (toward the viewer''s left), horizontal at shoulder height, index finger extended. Her face is level now, eyes on her fingertip. ARM LENGTH: the raised arm is drawn at its full length - from the shoulder joint to the fingertip it is as long as the distance from her shoulder down to the middle of her thigh (in the first image the hanging arm reaches that far); the upper arm and the forearm are each as long as in the first image. Do not shorten it.'
    wl_r3 = 'the arm nearer the viewer points forward and a little downward (toward the viewer''s left), the hand at the height of her chest, index finger extended and pressed against something, the elbow a little bent. Her head is bowed a little, eyes on her fingertip. ARM LENGTH: the raised arm is drawn at its full length - from the shoulder joint to the fingertip it is as long as the distance from her shoulder down to the middle of her thigh (in the first image the hanging arm reaches that far); the upper arm and the forearm are each as long as in the first image. Do not shorten it.'
  }; inb = [ordered]@{
    wl_01 = @{ refs = @('wl0', 'wl_r1'); text = 'half way: the arm nearer the viewer is half raised, the hand at the height of her chest on its way up, fingers opening.' }
    wl_12 = @{ refs = @('wl_r1', 'wl_r2'); text = 'half way: the hand is sliding down, now at the height of her forehead; her face is half way down from looking up.' }
    wl_23 = @{ refs = @('wl_r2', 'wl_r3'); text = 'half way: the hand is sliding down, between shoulder height and chest height; her head beginning to bow.' }
  }; wind = @{ of = 'wl_r3'; names = @('wl_w1', 'wl_w2', 'wl_w3'); text = @(
    'a light wind comes from the viewer''s left. ONLY the loose ends of her hair, the two tails of the bow and the hem of her dress move: they are lifted a LITTLE toward the viewer''s right. ' + $windOnly
    'a light wind comes from the viewer''s left. ONLY the loose ends of her hair, the two tails of the bow, the neckerchief tails and the hem of her dress move: they stream clearly toward the viewer''s right. ' + $windOnly
    'a light wind comes from the viewer''s left. ONLY the loose ends of her hair, the two tails of the bow and the hem of her dress move: the hair ends curl up a little toward the viewer''s right and the hem swings back half way. ' + $windOnly) }
  }
  ca = @{ same = $sameR; items = [ordered]@{
    ca_take = 'she does not hold the sheet in front of her chest yet: her arm on the viewer''s left side is raised high above her head, the hand taking hold of the lower edge of the sheet of paper (the flat pale cyan (#9FE8FF) rectangle), which is above her head; her head is tilted back, eyes on it; her other arm hangs at her side.' + $armNote
    ca_read2 = 'her head is bowed a little more and her eyes are lower: she has read further down the sheet. Nothing else changes.'
    ca_stop = 'she has stopped reading. Her head has come up a little; her eyes are WIDE open, fixed on the sheet; her lips are parted; her hands grip the sheet tighter and have lowered it a little.'
    ca_stopo = 'she has stopped reading with a start. Her head has jerked up and back; her eyes are WIDE open, fixed on the sheet; her mouth is open; her shoulders are raised; her hands grip the sheet tightly and have pulled it a little toward her.'
  }; inb = [ordered]@{
    ca_01 = @{ refs = @('ca_take', 'ca0'); text = 'half way: the raised hand is bringing the sheet down, now in front of her face; the other hand is coming up to take its other edge; her head is half way down.' }
  } }
  cb = @{ same = $sameR; items = [ordered]@{
    cb_down = 'her head is bowed and her eyes look down at her own hand on her chest, eyebrows raised, lips parted. Nothing else changes.'
    cb_up = 'her head is lifted and tilted back a little: she looks up and around above her, eyes wide, mouth open in wonder; her hand still pressed on her chest.'
    cb_out = 'her head is lifted, looking up above her with a beginning smile, tears starting in her eyes; her LEFT arm (viewer''s right) is raised out to the side, palm up and open, reaching toward something in the air; her right hand still pressed on her chest. A wind from the viewer''s left moves the ends of her hair, the bow tails, the neckerchief and the hem of the dress toward the viewer''s right.' + $armNote
  }; inb = [ordered]@{
    cb_12 = @{ refs = @('cb_down', 'cb_up'); text = 'half way: her head is coming up, eyes rising, level now.' }
    cb_23 = @{ refs = @('cb_up', 'cb_out'); text = 'half way: her left arm is half raised out to the side, the hand opening; the wind is just beginning to move her hair.' }
  }; wind = @{ of = 'cb_out'; names = @('cb_w1', 'cb_w2'); text = @(
    'the wind gusts: ONLY the loose ends of her hair, the two tails of the bow, the neckerchief tails and the hem of her dress move a little further toward the viewer''s right. The head shape, face, ear units, arms and body are traced unchanged.'
    'the wind eases: ONLY the loose ends of her hair, the two tails of the bow, the neckerchief tails and the hem of her dress swing half way back. The head shape, face, ear units, arms and body are traced unchanged.') }
  }
  cc = @{ same = $sameB; items = [ordered]@{
    cc_b = 'her eyes are half closed in a blink: the upper lids cover the top half of the irises. The tear is in the same place.'
    cc_2 = 'her LEFT hand (viewer''s right) has come up into the picture from below and its fingertips touch the tear on her cheek; her eyes are lowered toward the hand; lips parted. Only the hand and wrist come into the picture; the "02" stays exactly where it is on her upper arm; the hand, wrist and forearm have NO marking.'
    cc_3 = 'both eyes are brimming and tears run down BOTH cheeks; her eyebrows are raised and drawn together; her mouth trembles between crying and a smile. No hand in the picture.'
    cc_4 = 'her eyes are closed in two joyful arcs, tears streaming down both cheeks, and her mouth is open in a big, laughing, crying smile. No hand in the picture.'
  }; inb = [ordered]@{
    cc_12 = @{ refs = @('cc0', 'cc_2'); text = 'half way: her hand is rising into the picture from below, not yet at her cheek; her eyes begin to lower.' }
    cc_34 = @{ refs = @('cc_3', 'cc_4'); text = 'half way: her eyes are closing, half shut, and her mouth is opening into the smile.' }
  } }
  cd = @{ same = $sameR; items = [ordered]@{
    cd_a = 'her arms are only beginning to open: both hang low and a little away from her sides, palms turning forward; her head is level; her eyes are open, wet, looking up; her mouth is open in a beginning smile. The wind is the same.' + $armNote
    cd_b = 'her arms are half way open: out to her sides at the height of her waist, palms up; her head beginning to tilt back; eyes half closed, tears, laughing.' + $armNote
  }; wind = @{ of = 'cd0'; names = @('cd_w1', 'cd_w2'); text = @(
    'the wind gusts: ONLY the loose ends of her hair, the two tails of the bow, the neckerchief tails and the hem of her dress move a little further toward the viewer''s right. The head shape, face, ear units, arms and body are traced unchanged.'
    'the wind eases: ONLY the loose ends of her hair, the two tails of the bow, the neckerchief tails and the hem of her dress swing half way back. The head shape, face, ear units, arms and body are traced unchanged.') }
  }
  up = @{ same = $sameR; items = [ordered]@{
    up_a = 'her arms are not raised yet: they are opening out, low, a little away from her sides, palms forward; her head is only beginning to tilt back; her eyes are closed, tears on her cheeks; her mouth is open, singing. The wind from below is the same.' + $armNote
    up_b = 'her arms are half way up: stretched out to both sides at shoulder height, palms up; her head half way back; eyes closed, tears, mouth open, singing.' + $armNote
  }; wind = @{ of = 'up0'; names = @('up_w1', 'up_w2'); text = @(
    'the wind from below gusts: ONLY the loose ends of her hair, the two tails of the bow, the neckerchief tails and the hem of her dress are lifted a little higher. The head shape, face, ear units, arms, hands and body are traced unchanged.'
    'the wind from below eases: ONLY the loose ends of her hair, the two tails of the bow, the neckerchief tails and the hem of her dress sink half way back. The head shape, face, ear units, arms, hands and body are traced unchanged.') }
  }
  rn = @{ same = $sameR.Replace('the same SIZE and POSITION of her head and body in the picture', 'her HEAD exactly the same SIZE as in the first image and at the same place in the picture, her body, arms, legs and boots exactly the same sizes as in the first image (she stays about six heads tall: do NOT enlarge the head, do NOT shrink the body or shorten the legs)'); items = [ordered]@{
    rn_c1 = 'she is RUNNING at full speed toward the viewer''s left - CONTACT: the leg nearer the viewer has landed: its heel strikes the ground well in front of her body, the knee almost straight; the far leg trails behind, bent, its boot kicked up behind her. Her body leans forward. The arm nearer the viewer is back with the elbow bent, the far arm forward. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_d1 = 'she is RUNNING at full speed toward the viewer''s left - DOWN: her weight is on the leg nearer the viewer, its knee bent, the boot flat on the ground directly under her body (her body is at its lowest); the far leg is folded, its knee swinging forward under her hips, the boot behind. Her body leans forward; both elbows are bent with the arms passing her sides. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_p1 = 'she is RUNNING at full speed toward the viewer''s left - PUSH-OFF: the leg nearer the viewer is stretched out straight behind her, only its toe still on the ground, pushing off; the knee of the far leg is driven high forward. Her body leans forward. The arm nearer the viewer swings forward with the elbow bent, the far arm back. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_f1 = 'she is RUNNING at full speed toward the viewer''s left - FLIGHT: both boots are off the ground; the FAR leg reaches forward with the knee bent, the leg nearer the viewer is stretched out behind her. Her body leans forward. The arm nearer the viewer is forward, the far arm back. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_c2 = 'she is RUNNING at full speed toward the viewer''s left - CONTACT: the FAR leg has landed: its heel strikes the ground well in front of her body, the knee almost straight; the leg nearer the viewer trails behind, bent, its boot kicked up behind her. Her body leans forward. The arm nearer the viewer is forward with the elbow bent, the far arm back. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_d2 = 'she is RUNNING at full speed toward the viewer''s left - DOWN: her weight is on the FAR leg, its knee bent, the boot flat on the ground directly under her body (her body is at its lowest); the leg nearer the viewer is folded, its knee swinging forward under her hips, the boot behind. Her body leans forward; both elbows are bent with the arms passing her sides. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_p2 = 'she is RUNNING at full speed toward the viewer''s left - PUSH-OFF: the FAR leg is stretched out straight behind her, only its toe still on the ground, pushing off; the knee of the leg nearer the viewer is driven high forward. Her body leans forward. The arm nearer the viewer swings back, the far arm forward. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_f2 = 'she is RUNNING at full speed toward the viewer''s left - FLIGHT: both boots are off the ground; the leg NEARER the viewer reaches forward with the knee bent, the far leg is stretched out behind her. Her body leans forward. The arm nearer the viewer is back, the far arm forward. Her eye is open, mouth open, panting; her hair, the tails of the bow, the neckerchief and the dress stream out behind her (to the viewer''s right).'
    rn_s1 = 'she is BRAKING hard from a run toward the viewer''s left: her body leans BACK, both legs are thrust forward with the knees bent and both heels digging into the ground, the leg nearer the viewer ahead; both arms are flung out for balance; her hair, bow tails and dress swing FORWARD past her (toward the viewer''s left); her eye is wide open, mouth open.'
    rn_s2 = 'she has just stopped: she stands with her feet apart, knees a little bent, body upright; both hands are half way up toward her chest; her hair, bow tails and dress are settling; her head is bowed a little, eye open, mouth open, panting; tear tracks on her cheek.'
    rn_s3b = 'she is breathing IN: her shoulders and her hands on her chest are drawn a few pixels higher. Nothing else changes.'
  }; inb = [ordered]@{
    rn_s12 = @{ refs = @('rn_s1', 'rn_s2'); text = 'half way: her body is coming upright over her feet, knees still bent, arms coming in from the sides; her hair and dress swing back from in front of her.' }
    rn_s23 = @{ refs = @('rn_s2', 'rn0'); text = 'half way: her feet are drawing together, her hands have just reached her chest, her head is half bowed, eye half closed.' }
  } }
  pg = @{ same = $sameR; items = [ordered]@{
    pg_1 = 'one sheet of paper (a flat pale cyan (#9FE8FF) rectangle) has landed in her hands: she holds it by its two side edges in front of her chest, tilted toward her face; her head is bowed a little, eyes on it.'
    pg_2 = 'she holds one sheet of paper (a flat pale cyan (#9FE8FF) rectangle) by its two side edges, lifted close in front of her face; her eyes are wide, reading; her lips are parted; a fresh tear is on her cheek.'
  } }
  mq = @{ same = $sameB; items = [ordered]@{ mq_b = 'her eyes are open now, soft and half lowered, shining wet, looking down and inward; the same quiet warm smile.' } }
  ms = @{ same = $sameB; items = [ordered]@{ ms_b = 'the next sob: her head is bowed lower, her mouth is open wider, the tears run faster and two drops fall from her chin; her shoulder is raised.' } }
  bd = @{ same = $sameR; items = [ordered]@{
    bd_a = 'her arm is NOT raised: both arms hang at her sides. She has just noticed something in front of her at the height of her face: her eyes are fixed on it, a little wide, lips closed. The tear tracks are the same.'
    bd_c = 'she holds one small sheet of paper (a flat pale cyan (#9FE8FF) rectangle, about as wide as her two hands) in BOTH hands in front of her chest and looks down at it; her head is bowed; tears run down her cheeks; her mouth trembles in a small smile.' + $armNote
  }; inb = [ordered]@{
    bd_01 = @{ refs = @('bd_a', 'bd0'); text = 'half way: the arm is half raised, the hand at the height of her shoulder on its way up, fingers opening.' }
    bd_12 = @{ refs = @('bd0', 'bd_c'); text = 'half way: the raised hand is coming down holding the small pale cyan sheet by its corner, now at the height of her collar; the other hand is rising to meet it; her head begins to bow.' }
  } }
  hi = @{ same = $sameR; items = [ordered]@{ hi_b = 'her eyes are half closed in a slow mechanical blink: the upper lids cover the top half of the irises. Nothing else changes.' } }
  dr = @{ same = $sameR; items = [ordered]@{
    dr_b = 'the hand with the pencil has moved a little toward the viewer''s right and turned at the wrist: the next moment of the same pencil stroke. Nothing else changes.'
    dr_up = 'she has straightened up and lifted her head: she looks up and a little to the viewer''s right, remembering, eyes soft and wet, lips closed in a small smile. Her two hands stay EXACTLY where they are in the first image, down on the board (her arms are a little straighter): only her back, shoulders and head rise.'
    dr_wipe = 'she has straightened up; her LEFT hand (viewer''s right) is raised and wipes her cheek with the back of the wrist; her eyes are closed; she is smiling; a tear on the other cheek. The hand with the pencil stays EXACTLY where it is in the first image, down on the board.' + $armNote
    dr_smile = 'she is bent over her drawing exactly as in the first image, but now she is smiling widely, with tear tracks on both cheeks, eyes bright.'
    dr_end = 'she has straightened up completely and stands upright: both arms are lowered at her sides, the pencil still in her right hand; her head is bowed a little, looking down at her finished work with a peaceful, loving smile; tear tracks on her cheeks.' + $armNote
  }; inb = [ordered]@{
    dr_01 = @{ refs = @('dr0', 'dr_up'); text = 'half way: her back is half straightened and her head half lifted, eyes rising from the work.' }
    dr_12 = @{ refs = @('dr_up', 'dr_wipe'); text = 'half way: her left hand is half way up to her cheek; her eyes are closing.' }
    dr_45 = @{ refs = @('dr_smile', 'dr_end'); text = 'half way: her back is half straightened, her hands leaving the board and half lowered, her head still bowed, smiling.' }
  } }
  si = @{ same = $sameR; items = [ordered]@{
    si_st = 'she is NOT sitting: she STANDS upright, in the same exact side view facing the viewer''s right, legs straight, boots on the ground, arms hanging at her sides; there is no stool seat in the picture. Her head is at the height it would be standing (higher in the picture than in the first image) and bowed a little; she looks down in front of her with the same small peaceful smile. Her proportions are exactly those of the SECOND attached image.'
    si_cl = 'her eye is closed, and her smile is a little wider and completely at peace; her head is tilted down a very little. Nothing else changes.'
  }; refs2 = @{ si_st = 'canon:rin_side_r.png' }; inb = [ordered]@{
    si_half = @{ refs = @('si_st', 'si0'); text = 'half way through sitting down: her knees are half bent and her hips are lowering back toward the round stool seat (the seat is drawn where it is in the second image), her body leaning a little forward, her hands coming forward toward her knees.' }
  } }
  la = @{ same = $sameL; items = [ordered]@{
    la_b = 'his right hand with the pencil has moved a little to the viewer''s right along its line, and the wrist has turned slightly: the next moment of the same pencil stroke. Nothing else changes.'
    la_1 = 'he has stopped drawing and straightened up a little: head lifted and level, eyes looking down at his own work with a tired, dissatisfied look, brows slightly drawn, mouth a small flat line; the pencil hand rests still.'
    la_2 = 'he is yawning hugely: head tipped back a little, eyes squeezed shut, mouth wide open, his LEFT hand (viewer''s right) raised with its back in front of his mouth; the right hand with the pencil rests still.'
    la_3 = 'he has fallen asleep at the board: his head rests sideways on his LEFT fist (viewer''s right), the elbow propped at the height of the board, eyes closed, mouth slightly open, face completely relaxed; the right hand lies limp with the pencil loose in the fingers.'
    la_3b = 'he has fallen asleep at the board: his head rests sideways on his LEFT fist (viewer''s right), the elbow propped at the height of the board, eyes closed, mouth slightly open, face completely relaxed; the right hand lies limp with the pencil loose in the fingers; he is breathing IN: the shoulders and the head are a few pixels higher than at rest.'
    la_4 = 'he has just woken with a start, with an idea: his head is lifted and turned a little toward the viewer''s right, eyes WIDE open and bright, looking up and off past the viewer''s right shoulder, mouth a little open; his left hand has dropped from his face to the height of the board.'
    la_5 = 'his head is lifted, looking up and off past the viewer''s right shoulder, and he is SMILING: a wide, warm, boyish smile, eyes bright; both hands at the height of the board, the right one gripping the pencil again.'
    la_6 = 'he is drawing again, quickly, bent over the work exactly as in the first image - but now he is smiling to himself, a small happy smile, brows relaxed.'
  }; inb = [ordered]@{
    la_12 = @{ refs = @('la_1', 'la_2'); text = 'half way into the yawn: his head beginning to tip back, eyes half closed, mouth opening, the left hand half way up toward the mouth.' }
    la_23 = @{ refs = @('la_2', 'la_3'); text = 'half way: the yawn is over, his eyes are closing heavily, mouth nearly shut; his left hand has closed into a fist beside his cheek and his head is beginning to sink sideways onto it.' }
    la_34 = @{ refs = @('la_3', 'la_4'); text = 'half way: his head has just come up off the fist, eyes snapping half open, the fist still raised beside his cheek.' }
    la_45 = @{ refs = @('la_4', 'la_5'); text = 'half way: the mouth is closing into the beginning of a smile, the eyes still wide.' }
  } }
  ls = @{ same = $sameL; items = [ordered]@{
    ls_b = 'his hand with the pencil has moved a little forward along its line: the next moment of the same pencil stroke. Nothing else changes.'
    ls_up = 'he has lifted his head from the work and turned his face up toward the viewer''s right, looking at someone standing there, with a small warm smile; the pencil hand rests still.'
    ls_45 = 'he is now about forty-five years old, as in the SECOND attached image: the same man, the same pose bent over his work, but his blond hair is duller and a little longer, tied in the same small ponytail, he wears round glasses, and his face is leaner with a first line beside the mouth.'
    ls_gone = 'the man is GONE: only the empty stool stands there, exactly where and as it is drawn in the first image (the whole round seat is now visible). Nothing else is in the picture.'
    ls_78 = 'he is now very old, as in the SECOND attached image: the same man in the same pose, but more stooped, his back rounded; his hair is long, thin and white, tied in the same small ponytail; round glasses; a thin lined face; his lab coat is worn and patched; his hand with the pencil is thin.'
  }; refs2 = @{ ls_45 = 'canon:len_age45.png'; ls_78 = 'canon:len_age78.png' } }
  me = @{ same = $sameL; items = [ordered]@{
    me_30 = 'he is about thirty now (the same face, a little leaner). With both hands he holds up one sheet of paper to show it to the viewer (draw the sheet as a flat pale cyan (#9FE8FF) rectangle facing the viewer, beside his face, not covering it), grinning proudly, looking up at the viewer.'
    me_45 = 'he is about forty-five now, as in the SECOND attached image: the same man, the same pose turned to look up at the viewer, but his blond hair is duller and a little longer in the same small ponytail, he wears round glasses, and his face is leaner. In his left hand he holds a small white teacup at chest height; he smiles up at the viewer, gently, gratefully.'
    me_65 = 'he is about sixty-five now: the same man, the same pose turned to look up at the viewer, but his hair has gone grey-white, long, in the same small ponytail; round glasses; lines on his forehead and beside his mouth; his shoulders are a little rounded. The same warm smile up at the viewer, a little tired. The pencil is in his right hand.'
    me_gone = 'the man is GONE: only the empty stool stands there, exactly where and as it is drawn in the first image (the whole round seat is now visible). Nothing else is in the picture.'
    me_78 = 'he is very old now, as in the SECOND attached image: the same man, the same pose turned to look up at the viewer, but stooped and thin, with long thin white hair in the same small ponytail, round glasses, a deeply lined face, the lab coat worn and patched. He still turns to look up at the viewer, with the same warm smile, very tired, eyes wet. The pencil is in his thin right hand.'
  }; refs2 = @{ me_45 = 'canon:len_age45.png'; me_78 = 'canon:len_age78.png' }; after = [ordered]@{
    me0w = @{ of = 'me0'; text = 'he has NOT turned to the viewer yet: his head faces his work (toward the viewer''s right, where the board would be), bowed over it, so that we see his face in three-quarter profile, eyes lowered on the work, mouth closed, concentrating; his hand with the pencil is at work. His age, hair, glasses and clothes are exactly those of the first image.' }
    me0wb = @{ of = 'me0w'; text = 'his hand with the pencil has moved a little forward along its line and the wrist has turned: the next moment of the same pencil stroke. Nothing else changes.' }
    me_30w = @{ of = 'me_30'; text = 'he has NOT turned to the viewer yet: his head faces his work (toward the viewer''s right, where the board would be), bowed over it, so that we see his face in three-quarter profile, eyes lowered on the work, mouth closed, concentrating; his hand with the pencil is at work. His age, hair, glasses and clothes are exactly those of the first image. Both hands are at his work; there is no sheet held up.' }
    me_45w = @{ of = 'me_45'; text = 'he has NOT turned to the viewer yet: his head faces his work (toward the viewer''s right, where the board would be), bowed over it, so that we see his face in three-quarter profile, eyes lowered on the work, mouth closed, concentrating; his hand with the pencil is at work. His age, hair, glasses and clothes are exactly those of the first image. The teacup stands aside; both hands are at his work.' }
    me_65w = @{ of = 'me_65'; text = 'he has NOT turned to the viewer yet: his head faces his work (toward the viewer''s right, where the board would be), bowed over it, so that we see his face in three-quarter profile, eyes lowered on the work, mouth closed, concentrating; his hand with the pencil is at work. His age, hair, glasses and clothes are exactly those of the first image.' }
    me_78w = @{ of = 'me_78'; text = 'he has NOT turned to the viewer yet: his head faces his work (toward the viewer''s right, where the board would be), bowed over it, so that we see his face in three-quarter profile, eyes lowered on the work, mouth closed, concentrating; his hand with the pencil is at work. His age, hair, glasses and clothes are exactly those of the first image.' }
  } }
  ki = @{ same = $sameK; items = [ordered]@{
    ki_b = 'his fist with the crayon has moved a little to one side: the next moment of the same crayon stroke. Nothing else changes.'
    ki_up = 'he has stopped drawing and lifted his head: he looks up and away past the viewer''s left shoulder at the big empty room around him, mouth a small flat line, eyes a little sad; the crayon rests on the paper in his fist.'
  } }
  ol = @{ same = $sameL.Replace('the same man', 'the same old man').Replace('Anything not named below', 'It stays a close-up in profile, cropped only by the bottom edge of the picture. Anything not named below'); items = [ordered]@{
    ol_1 = 'he has stopped working: his eyes have lifted a little toward something that has just come down in front of him (below the picture, to the viewer''s right); his eyebrows are raised, his lips parted.'
    ol_2 = 'he has lifted his head: he looks up and ahead (toward the viewer''s right), level, eyes wide behind the glasses, lips parted - as if he sees someone standing there.'
    ol_3 = 'he has lifted his head and looks ahead (toward the viewer''s right), level; his eyes are wet and half closed with a slow, soft, grateful smile.'
  }; inb = [ordered]@{
    ol_12 = @{ refs = @('ol_1', 'ol_2'); text = 'half way: his head is half lifted, his eyes rising.' }
  } }
  du = @{ same = $sameD; items = [ordered]@{
    du_1 = 'he has set the big soft white bow down on the top of her head, upright, exactly as she wears it in the THIRD... no: he has set the big soft white ribbon bow down on the top of her head, upright (two big rounded loops and a knot in the middle), and both his hands are at its knot, tying it. BOTH of his arms are raised and BOTH are fully visible from shoulder to hand, each hand joined to its own forearm: the arm nearer the viewer in front, the other arm seen beyond it. He has exactly two hands; she has exactly two hands, hanging at her sides. His eyes are on the knot.'
    du_2 = 'the big soft white ribbon bow now sits on the top of her head, tied (two big rounded loops and a knot in the middle); he has taken both hands away and stepped half a step back: he stands straight with his arms lowered, hands half open in front of him, looking at her face with a small proud smile.'
    du_2b = 'the big soft white ribbon bow now sits on the top of her head, tied (two big rounded loops and a knot in the middle); he has taken both hands away and stepped half a step back: he stands straight with his arms lowered, hands half open in front of him, looking at her face with a small proud smile; HER eyes are half closed in a slow mechanical blink, the upper lids covering the top half of the irises.'
    du_3 = 'the big soft white ribbon bow now sits on the top of her head, tied (two big rounded loops and a knot in the middle); he has stepped half a step back and stands straight, one hand at his own chin, head tilted a little, looking at her with a wide happy smile; she has not moved at all.'
  }; inb = [ordered]@{
    du_01 = @{ refs = @('du0', 'du_1'); text = 'half way: the bow is just touching the top of her hair, his hands lowering it; his elbows half bent.' }
    du_12 = @{ refs = @('du_1', 'du_2'); text = 'half way: the bow is tied; his hands have just left the knot and are half way down; he is leaning back, half way through his half step back.' }
    du_23 = @{ refs = @('du_2', 'du_3'); text = 'half way: one hand is rising toward his chin; his head is beginning to tilt; the smile widening.' }
  } }
}
$sets.du.items.du_1 = 'he has set the big soft white ribbon bow down on the top of her head, upright (two big rounded loops and a knot in the middle), and both his hands are at its knot, tying it. BOTH of his arms are raised and BOTH are fully visible from shoulder to hand, each hand joined to its own forearm: the arm nearer the viewer in front, the other arm seen beyond it. He has exactly two hands; she has exactly two hands, hanging at her sides. His eyes are on the knot.'

$sets['hf'] = @{ same = 'Redraw the FIRST attached image EXACTLY: the same hand and forearm reaching in from the lower left corner, the same picture size and framing, the same position, the same sleeve, line weight, colors and shadow shapes, the same flat magenta (#FF00FF) background, no text, no watermark. CHANGE ONLY THIS:'; items = [ordered]@{ hf_empty = 'the hand holds NOTHING: the daisy is gone from the picture; the thumb and forefinger have just opened, the fingers relaxed and a little apart, as if they have just let go of something.' } }
$gen = Join-Path $root 'tools\gen.ps1'
function Stem([string]$name) { if ($name -match '^(\w+?)0$') { "$name`_$($pick[$Matches[1]])" } else { "$name`_1" } }
Add-Type -AssemblyName System.Drawing
function SizeNote($path) { $i = [System.Drawing.Image]::FromFile($path); $s = " THE PICTURE: exactly the same pixel size and shape as the FIRST attached image ($($i.Width) x $($i.Height) pixels, the same aspect ratio); do not change the canvas."; $i.Dispose(); $s }
$py = Join-Path $root '.venv\Scripts\python.exe'
$padDir = Join-Path $R 'pad'
New-Item -ItemType Directory -Force -Path $padDir | Out-Null
# every reference goes to the model as a 2:3 picture (tools/pad_ref.py): it answers a 2:3 picture with a 2:3 picture
function Padded($path) {
  if (-not (Test-Path -LiteralPath $path)) { return $path }
  $o = Join-Path $padDir (Split-Path -Leaf $path)
  if (-not (Test-Path -LiteralPath $o) -or ((Get-Item -LiteralPath $o).LastWriteTime -lt (Get-Item -LiteralPath $path).LastWriteTime)) { & $py (Join-Path $root 'tools\pad_ref.py') $path $o }
  $o
}
function Job($name, $text, $refs) {
  $ready = -not ($refs | Where-Object { -not (Test-Path -LiteralPath $_) })
  if (-not $NoPad) { $refs = @($refs | ForEach-Object { if ($_ -like "$R\*") { Padded $_ } else { $_ } }) }
  if ($refs.Count -and (Test-Path -LiteralPath $refs[0])) { $text += (SizeNote $refs[0]) }
  $pf = Join-Path $R "$name.txt"
  Set-Content -LiteralPath $pf -Value $text -Encoding UTF8
  [pscustomobject]@{ Prompt = $pf; Out = (Join-Path $R "$name`_1.png"); Ref = $refs; Ready = $ready }
}
$stage1 = @(); $stage2 = @()
foreach ($s in $sets.Keys) {
  if ($Only.Count -and $Only -notcontains $s) { continue }
  $cfg = $sets[$s]
  $master = Join-Path $R ((Stem "${s}0") + '.png')
  if (-not (Test-Path -LiteralPath $master)) { "no master for $s ($master)"; continue }
  foreach ($k in $cfg.items.Keys) {
    $refs = @($master)
    if ($cfg.refs2 -and $cfg.refs2[$k]) { $refs += (Join-Path $C ($cfg.refs2[$k] -replace '^canon:', '')) }
    $stage1 += Job $k "$($cfg.same) $($cfg.items[$k])" $refs
  }
  if ($cfg.wind) {
    $base = Join-Path $R ((Stem $cfg.wind.of) + '.png')
    for ($i = 0; $i -lt $cfg.wind.names.Count; $i++) { $stage2 += Job $cfg.wind.names[$i] "$($cfg.same) $($cfg.wind.text[$i])" @($base) }
  }
  if ($cfg.after) { foreach ($k in $cfg.after.Keys) {
    $stage2 += Job $k "$($cfg.same) $($cfg.after[$k].text)" @((Join-Path $R ((Stem $cfg.after[$k].of) + '.png')))
  } }
  if ($cfg.inb) { foreach ($k in $cfg.inb.Keys) {
    $refs = @($cfg.inb[$k].refs | ForEach-Object { Join-Path $R ((Stem $_) + '.png') })
    $stage2 += Job $k "$inbHead $($cfg.inb[$k].text)" $refs
  } }
}
"stage 1: $($stage1.Count) drawings from the masters"
$stage1 | ForEach-Object -Parallel { & $using:gen -PromptFile $_.Prompt -OutPath $_.Out -Ref $_.Ref } -ThrottleLimit $Throttle
"stage 2: $($stage2.Count) drawings between and wind"
$stage2 | Where-Object { $_.Ready } | ForEach-Object -Parallel { & $using:gen -PromptFile $_.Prompt -OutPath $_.Out -Ref $_.Ref } -ThrottleLimit $Throttle
"done: $((Get-ChildItem -LiteralPath $R -Filter '*.png').Count) png"

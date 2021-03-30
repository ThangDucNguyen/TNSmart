/// <reference types="next" />
/// <reference types="next/types/global" />

type $FixType = any;
type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

